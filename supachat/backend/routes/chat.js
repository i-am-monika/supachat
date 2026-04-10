const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function getSQL(message) {
  const msg = message.toLowerCase();

  if (msg.includes('top') && msg.includes('likes')) {
    return `SELECT a.title, a.topic, e.likes 
            FROM articles a 
            JOIN engagement e ON a.id = e.article_id 
            ORDER BY e.likes DESC LIMIT 3`;
  }
  if (msg.includes('trend') || msg.includes('views')) {
    return `SELECT a.title, SUM(v.view_count) as total_views 
            FROM articles a 
            JOIN views v ON a.id = v.article_id 
            GROUP BY a.title 
            ORDER BY total_views DESC`;
  }
  if (msg.includes('topic') || msg.includes('engagement')) {
    return `SELECT a.topic, SUM(e.likes) as total_likes, 
            SUM(e.shares) as total_shares 
            FROM articles a 
            JOIN engagement e ON a.id = e.article_id 
            GROUP BY a.topic 
            ORDER BY total_likes DESC`;
  }
  if (msg.includes('author')) {
    return `SELECT a.author, COUNT(*) as articles, 
            SUM(e.likes) as total_likes 
            FROM articles a 
            JOIN engagement e ON a.id = e.article_id 
            GROUP BY a.author 
            ORDER BY total_likes DESC`;
  }
  // default
  return `SELECT a.title, a.topic, e.likes, e.shares 
          FROM articles a 
          JOIN engagement e ON a.id = e.article_id 
          ORDER BY e.likes DESC`;
}

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const sql = getSQL(message);
    console.log('Generated SQL:', sql);

    const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });

    if (error) {
      // fallback to direct query
      const { data: fallback, error: fallbackError } = await supabase
        .from('articles')
        .select('*, engagement(*), views(*)')
        .limit(5);

      if (fallbackError) throw fallbackError;

      return res.json({
        sql,
        result: fallback,
        answer: `Here are the results for: "${message}"`,
        type: 'table'
      });
    }

    res.json({
      sql,
      result: data,
      answer: `Here are the results for: "${message}"`,
      type: 'table'
    });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;