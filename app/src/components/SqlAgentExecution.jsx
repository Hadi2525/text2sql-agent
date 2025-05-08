import { useState } from 'react'
import MarkdownIt from 'markdown-it'
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#d0ed57',
  '#a4de6c', '#8dd1e1', '#83a6ed', '#d885a3',
  '#a28fd0', '#e28743', '#ff9999', '#99ccff'
]

const md = new MarkdownIt()

export default function SqlAgentExecutor({ uuid }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [answer, setAnswer] = useState(null)
  const [viz, setViz] = useState(null)
  const [data, setData] = useState([])

  const runAgent = async () => {
    if (!uuid) {
      setError('Please upload a file first.')
      return
    }
    setLoading(true)
    setError('')
    setAnswer(null)
    try {
      const res = await fetch('/run-sql-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid, query })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Unknown error')
      setAnswer(json.answer)
      setViz(json.visualization)
      const labels = json.formatted_data_for_visualization.labels
      const vals = json.formatted_data_for_visualization.values[0].data
      setData(labels.map((lbl, i) => ({ name: lbl, value: vals[i] })))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderChart = () => {
    if (!viz || data.length === 0) return null
    switch (viz) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555"/>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={120} stroke="#e0e0e0" />
              <YAxis stroke="#e0e0e0"/>
              <Tooltip contentStyle={{ backgroundColor: '#333', color: '#e0e0e0' }} />
              <Legend wrapperStyle={{ color: '#e0e0e0' }}/>
              <Bar dataKey="value" name="Expenses" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} stroke="#555">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={120} stroke="#e0e0e0"/>
              <YAxis stroke="#e0e0e0"/>
              <Tooltip contentStyle={{ backgroundColor: '#333', color: '#e0e0e0' }}/>
              <Legend wrapperStyle={{ color: '#e0e0e0' }}/>
              <Line type="monotone" dataKey="value" stroke="#82ca9d" dot />
            </LineChart>
          </ResponsiveContainer>
        )
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart stroke="#555">
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={130}
                fill="#8884d8"
                label
              >
                {data.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )
      default:
        return <p>Unsupported visualization: {viz}</p>
    }
  }

  return (
    <div className="section" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h3>Run SQL Agent</h3>
      <textarea
        placeholder="Enter your SQL agent question…"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <button onClick={runAgent} disabled={loading || !query.trim()}>
        {loading ? 'Running…' : 'Run SQL Agent'}
      </button>
      {error && <div className="error">{error}</div>}
      {answer && (
        <div id="results">
          <div
            style={{ marginTop: '10px', marginBottom: '20px' }}
            dangerouslySetInnerHTML={{ __html: md.render(answer) }}
          />
          {renderChart()}
        </div>
      )}
    </div>
  )
}
