import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { supabase } from './supabaseClient'
import logo from './assets/shiftwave-logo.png'

export default function PrivateForm() {
  const { register, handleSubmit } = useForm()
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch('https://shiftwave-backend.onrender.com/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`API Error: ${res.status} ${res.statusText} - ${errorText}`)
      }

      const result = await res.json()
      const score = result.priority_score

      const { error } = await supabase.from('priority_queue').insert({
        ...data,
        priority_score: score,
      })

      if (error) {
        alert('Error saving to database: ' + error.message)
      } else {
        setSubmitted(true)
      }
    } catch (err) {
      const error = err as Error
      alert('Failed to submit form: ' + error.message)
    }
  }

  if (submitted) {
    return <h2 style={{ fontFamily: 'Inter, sans-serif', textAlign: 'center', marginTop: '2rem' }}>🎉 Submission complete. Thank you!</h2>
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '2rem' }}>
      <img src={logo} alt="Shiftwave Logo" style={{ height: '40px', marginBottom: '1rem' }} />
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 500, margin: '0 auto', backgroundColor: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
        <h2 style={{ fontWeight: 600, color: '#0D1B2A' }}>White Glove Intake</h2>
        <input {...register('name')} placeholder="Full Name" required style={inputStyle} />
        <input {...register('email')} placeholder="Email Address" type="email" required style={inputStyle} />

        <label>Customer Type:</label>
        <select {...register('customer_type')} style={inputStyle}>
          <option value="">Select</option>
          <option value="pro_athlete">Pro Athlete</option>
          <option value="celebrity">Celebrity</option>
          <option value="coach_trainer">Coach/Trainer</option>
          <option value="influencer_partner">Influencer/Ambassador/Partner</option>
          <option value="team_rep">Team or Franchise Representative</option>
          <option value="government">Department of Defense/Government</option>
          <option value="business_owner">Business Owner (Franchise/Training Facility)</option>
          <option value="gifting_customer">Gifting Customer</option>
        </select>

        <label>Current Season Status:</label>
        <select {...register('season_status')} style={inputStyle}>
          <option value="offseason">Offseason</option>
          <option value="inseason">In Season</option>
          <option value="playoffs">Playoffs</option>
          <option value="not_applicable">Not Applicable</option>
        </select>

        <label>Injury Status:</label>
        <select {...register('injured')} style={inputStyle}>
          <option value="no">No</option>
          <option value="minor">Yes – Minor</option>
          <option value="serious">Yes – Serious</option>
        </select>

        <label>Repeat Customer?</label>
        <select {...register('repeat_customer')} style={inputStyle}>
          <option value="">Select...</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        <label>Urgency of Need:</label>
        <select {...register('urgency')} style={inputStyle}>
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="high">High</option>
          <option value="code_red">Code Red/Emergency</option>
        </select>

        <label>Public Influence / Competitive Standing:</label>
        <select {...register('public_influence')} style={inputStyle}>
          <option value="none">No notable public presence</option>
          <option value="moderate">Moderate (10k–100k followers)</option>
          <option value="high">Influencer / Celebrity (less than 100k followers)</option>
          <option value="top_100">Pro Athlete Top 100</option>
        </select>

        <label>Expected Purchase Scope:</label>
        <select {...register('purchase_scope')} style={inputStyle}>
          <option value="1">1 Unit</option>
          <option value="2-5">2–5 Units</option>
          <option value="6+">6+ Units or Franchise Order</option>
        </select>

        <label>Represents a Group or Organization?</label>
        <select {...register('represents_group')} style={inputStyle}>
          <option value="no">No</option>
          <option value="team">Yes – Team or Organization</option>
          <option value="franchise">Yes – Nationwide Franchise or Network</option>
        </select>

        <label>Is their Shiftwave system broken?</label>
        <select {...register('system_broken')} style={inputStyle}>
          <option value="not_applicable">Not applicable</option>
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>

        <label>Any additional notes or context?</label>
        <textarea {...register('additional_notes')} placeholder="Add notes here" style={{ ...inputStyle, height: '100px' }} />

        <button type="submit" style={{ backgroundColor: '#20B486', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
          Submit
        </button>
      </form>
    </div>
  )
}

const inputStyle = {
  padding: '0.5rem',
  border: '1px solid #ccc',
  borderRadius: '6px',
  width: '100%',
}
