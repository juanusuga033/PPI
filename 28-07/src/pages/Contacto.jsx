import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import '../styles/Contacto.css'

const defaultContact = {
  title: 'DONA Y VISTE',
  subtitle: 'Contáctanos',
  phone: '336-4824793',
  email: 'donayviste@gmail.com',
  website: 'www.Donayviste.com',
  address: 'Santo Domingo - Medellín',
  image_url: '/catalog/uniforme-15-page-4.jpeg',
}

// Presenta los canales de contacto y la información de ayuda.
export default function Contacto() {
  const [contact, setContact] = useState(defaultContact)

  useEffect(() => {
    async function loadContact() {
      const { data } = await supabase.from('contact_settings').select('*').eq('id', 1).maybeSingle()
      if (data) setContact(data)
    }
    loadContact()
  }, [])

  return (
    <div className="contacto-page">
      <div className="contacto-container">
        <div className="contacto-info">
          <h1>{contact.title}</h1>
          <p className="subtitle">{contact.subtitle}</p>
          
          <div className="info-item">
            <span className="icon">📱</span>
            <span>{contact.phone}</span>
          </div>
          
          <div className="info-item">
            <span className="icon">📧</span>
            <span>{contact.email}</span>
          </div>
          
          <div className="info-item">
            <span className="icon">🌐</span>
            <span>{contact.website}</span>
          </div>
          
          <div className="info-item">
            <span className="icon">📍</span>
            <span>{contact.address}</span>
          </div>
        </div>
        
        <div className="contacto-logo">
          <div className="shield">
            <img src={contact.image_url || defaultContact.image_url} alt="Imagen de contacto de Dona y Viste" />
          </div>
        </div>
      </div>
    </div>
  )
}