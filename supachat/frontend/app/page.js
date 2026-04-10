'use client';
import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am SupaChat 👋 Ask me anything about the blog analytics!', type: 'text' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestions = [
    'Show top 3 articles by likes',
    'Compare engagement by topic',
    'Show views trend',
    'List articles by author'
  ];

  const sendMessage = async (text) => {
    const userMessage = text || input;
    if (!userMessage.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
const res = await fetch('https://improved-space-umbrella-pjr4x5wg445vcvjj-3000.app.github.dev/api/chat', {
      method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();

      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}`, type: 'text' }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.answer,
          type: data.type,
          chartType: data.chartType,
          chartData: data.chartData,
          result: data.result,
          sql: data.sql
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Is the backend running?', type: 'text' }]);
    }
    setLoading(false);
  };

  const renderResult = (msg) => {
    if (msg.type === 'chart' && msg.chartData) {
      return (
        <div className="mt-3 bg-white rounded-lg p-3">
          <ResponsiveContainer width="100%" height={250}>
            {msg.chartType === 'line' ? (
              <LineChart data={msg.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            ) : (
              <BarChart data={msg.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      );
    }

    if (msg.result && Array.isArray(msg.result) && msg.result.length > 0) {
      const keys = Object.keys(msg.result[0]).filter(k => !['id', 'created_at', 'engagement', 'views'].includes(k));
      return (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm border-collapse bg-white rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-indigo-50">
                {keys.map(k => (
                  <th key={k} className="px-3 py-2 text-left text-indigo-700 font-semibold capitalize">
                    {k.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {msg.result.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {keys.map(k => (
                    <td key={k} className="px-3 py-2 text-gray-700">
                      {typeof row[k] === 'string' && row[k].includes('T')
                        ? new Date(row[k]).toLocaleDateString()
                        : String(row[k])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 shadow-sm">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">S</div>
        <div>
          <h1 className="font-bold text-gray-900 text-lg">SupaChat</h1>
          <p className="text-xs text-gray-500">Blog Analytics Assistant</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Connected</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl w-full ${msg.role === 'user' ? 'ml-12' : 'mr-12'}`}>
              <div className={`rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white ml-auto max-w-md'
                  : 'bg-white border border-gray-200 shadow-sm text-gray-800'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
              {msg.role === 'assistant' && renderResult(msg)}
              {msg.sql && (
                <p className="text-xs text-gray-400 mt-1 ml-1 font-mono truncate">
                  SQL: {msg.sql.slice(0, 80)}...
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 pb-3 max-w-4xl mx-auto w-full">
          <div className="flex gap-2 flex-wrap">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="text-xs bg-white border border-indigo-200 text-indigo-600 px-3 py-2 rounded-full hover:bg-indigo-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your blog analytics..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}