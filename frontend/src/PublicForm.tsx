import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { supabase } from './supabaseClient'

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
    return <h2>🎉 Thank you! Your submission has been received.</h2>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 500 }}>
      <h2>Shiftwave Intake Form</h2>
      <input {...register('name')} placeholder="Full Name" required />
      <input {...register('email')} placeholder="Email Address" type="email" required />

      <label>Which best describes you?</label>
      <select {...register('athlete_type')}>
        <option value="none">General Consumer</option>
        <option value="college">College Athlete</option>
        <option value="pro">Pro Athlete</option>
        <option value="retired">Former Athlete</option>
      </select>

      <label>Current Season Status:</label>
      <select {...register('season_status')}>
        <option value="offseason">Offseason</option>
        <option value="inseason">In Season</option>
        <option value="playoffs">Playoffs</option>
        <option value="not_applicable">Not Applicable</option>
      </select>

      <label>Are you currently managing an injury?</label>
      <select {...register('injured')}>
        <option value="no">No</option>
        <option value="minor">Yes – Minor</option>
        <option value="serious">Yes – Serious</option>
      </select>

      <label>Why are you using Shiftwave?</label>
      <select {...register('use_case')}>
        <option value="performance">Improved performance</option>
        <option value="recovery">Recovery</option>
        <option value="mental_health">Management of stress, sleep, or anxiety</option>
        <option value="all">All of the above</option>
      </select>

      <label>How did you hear about Shiftwave?</label>
      <input {...register('referral_source')} placeholder="Referral source" />

      <label>Have you used or purchased Shiftwave before?</label>
      <select {...register('repeat_customer')}>
        <option value="">Select...</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>

      <label>If you currently own one, is your system functioning?</label>
      <select {...register('system_broken')}>
        <option value="not_applicable">Not applicable</option>
        <option value="yes">No, it’s broken or unusable</option>
        <option value="no">Yes, it’s working</option>
      </select>

      <button type="submit">Submit</button>
    </form>
  )
}
