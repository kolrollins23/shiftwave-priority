import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { supabase } from './supabaseClient' // Ensure this import is correct

export default function PublicForm() {
  const { register, handleSubmit } = useForm()
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = async (data: any) => {
    try {
      console.log('Submitting form data:', data)

      // Send data to your backend scoring API
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
      console.log('Scored priority:', score)

      // Save to Supabase with score included
      const { error } = await supabase.from('priority_queue').insert({
        ...data,
        injured: data.injured === 'yes',
        priority_score: score,
      })

      if (error) {
        console.error('Supabase insert error:', error)
        alert('Error saving to database: ' + error.message)
      } else {
        setSubmitted(true)
      }
    } catch (err) {
      const error = err as Error // Explicitly cast to Error
      console.error('Error submitting form:', error)
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
      <label>Athlete Type:</label>
      <select {...register('athlete_type')} required>
        <option value="none">General Consumer</option>
        <option value="college">College Athlete</option>
        <option value="pro">Pro Athlete</option>
        <option value="retired">Retired Athlete</option>
      </select>
      <label>Season Status:</label>
      <select {...register('season_status')} required>
        <option value="offseason">Offseason</option>
        <option value="inseason">In Season</option>
        <option value="playoffs">Playoffs</option>
      </select>
      <label>Are you currently injured?</label>
      <select {...register('injured')} required>
        <option value="no">No</option>
        <option value="yes">Yes</option>
      </select>
      <label>Use Case:</label>
      <select {...register('use_case')} required>
        <option value="performance">Performance</option>
        <option value="needs_based">Needs Based</option>
        <option value="both">Both</option>
      </select>
      <button type="submit">Submit</button>
    </form>
  )
}
