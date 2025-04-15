import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { supabase } from './supabaseClient'
import logo from './assets/shiftwave-logo.png' // Ensure this path is valid or use URL

export default function PublicForm() {
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
    return <h2 style={{ fontFamily: 'Inter, sans-serif', textAlign: 'center', marginTop: '2rem' }}>🎉 Thank you! Your submission has been received.</h2>
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '2rem' }}>
      <img src={logo} alt="Shiftwave Logo" style={{ height: '40px', marginBottom: '1rem' }} />
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 500, margin: '0 auto', backgroundColor: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
        <h2 style={{ fontWeight: 600, color: '#0D1B2A' }}>Shiftwave Customer Information Form</h2>
        <input {...register('name')} placeholder="Full Name" required style={inputStyle} />
        <input {...register('email')} placeholder="Email Address" type="email" required style={inputStyle} />

        <label>Which best describes you?</label>
        <select {...register('athlete_type')} style={inputStyle}>
          <option value="none">General Consumer</option>
          <option value="college">College Athlete</option>
          <option value="pro">Pro Athlete</option>
          <option value="retired">Former Athlete</option>
        </select>

        <label>Current Season Status:</label>
        <select {...register('season_status')} style={inputStyle}>
          <option value="offseason">Offseason</option>
          <option value="inseason">In Season</option>
          <option value="playoffs">Playoffs</option>
          <option value="not_applicable">Not Applicable</option>
        </select>

        <label>Are you currently managing an injury?</label>
        <select {...register('injured')} style={inputStyle}>
          <option value="no">No</option>
          <option value="minor">Yes – Minor</option>
          <option value="serious">Yes – Serious</option>
        </select>

        <label>Why are you using Shiftwave?</label>
        <select {...register('use_case')} style={inputStyle}>
          <option value="performance">Improved performance</option>
          <option value="recovery">Recovery</option>
          <option value="mental_health">Management of stress, sleep, or anxiety</option>
          <option value="all">All of the above</option>
        </select>

        <label>How did you hear about Shiftwave?</label>
        <input {...register('referral_source')} placeholder="Referral source" style={inputStyle} />

        <label>Have you used or purchased Shiftwave before?</label>
        <select {...register('repeat_customer')} style={inputStyle}>
          <option value="">Select...</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        <label>If you currently own one, is your system functioning?</label>
        <select {...register('system_broken')} style={inputStyle}>
          <option value="not_applicable">Not applicable</option>
          <option value="yes">No, it’s broken or unusable</option>
          <option value="no">Yes, it’s working</option>
        </select>

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
