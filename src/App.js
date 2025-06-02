import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import './App.css';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import es from 'date-fns/locale/es';
registerLocale('es', es);

function App() {
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    Dto: '',
    comuna: '',
    telefono: '',
    correo: '',
    fecha: new Date(),
    tramo: '',
    servicio: '',
    tecnico: ''
  });

  const comunasAM = ['Providencia', 'Ñuñoa', 'La Reina', 'Peñalolén'];
  const comunasPM = ['La Florida', 'Las Condes', 'Vitacura', 'Lo Barnechea'];

  const asignarTecnico = (direccion) => {
    if (comunasAM.includes(direccion)) return 'Pablo Campusano';
    if (comunasPM.includes(direccion)) return 'Alberto Campusano';
    return 'Marcelo Campusano';
  };

  const correosTecnicos = {
    'Pablo Campusano': 'pablocampusano0204@gmail.com',
    'Alberto Campusano': 'betocampu@gmail.com',
    'Marcelo Campusano': 'fugasgas.cl@gmail.com'
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const tecnicoAsignado = asignarTecnico(form.direccion);
    const destinatario = correosTecnicos[tecnicoAsignado];

    const formConTecnico = {
      ...form,
      fecha: form.fecha?.toLocaleDateString(),
      tecnico: tecnicoAsignado,
      to_email: destinatario,
      bcc_email: 'fugasgas.cl@gmail.com'
    };

    try {
        await emailjs.send(
  'service_puqsoem', // Service ID
  'template_7fhj27n', // Template ID correcto
  formConTecnico,
  'gncxbnGHgXIEEkbOP' // Public Key (API key pública)
);

      alert('Reserva enviada con éxito. Revisa tu correo.');
      setForm({
        nombre: '',
        direccion: '',
        Dto: '',
        comuna: '',
        telefono: '',
        correo: '',
        fecha: new Date(),
        tramo: '',
        servicio: '',
        tecnico: ''
      });
    } catch (error) {
  console.error('ERROR AL ENVIAR:', error);
  alert('Error al enviar reserva. Intenta nuevamente.');
}  };

  return (
    <div className="phone-frame">
      <div className="app-content">
        <div className="logo-container">
          <img src="/logo.png" alt="Fugas-Gas Logo" className="logo" />
        </div>
        <h1 className="titulo-principal">Bienvenido</h1>

        <div className="calendar-wrapper">
          <div className="calendar-header">
            <p className="calendar-title">Agende su visita en segundos</p>
            <p className="calendar-subtitle">Seleccione Día.</p>
          </div>
          <DatePicker
            locale="es"
            inline
            selected={form.fecha}
            onChange={(date) => setForm({ ...form, fecha: date })}
            dateFormat="dd-MM-yyyy"
            className="custom-datepicker"
            calendarStartDay={1}
          />
        </div>

        <form onSubmit={handleSubmit}>
          <input type="text" name="nombre" placeholder="Nombre completo" onChange={handleChange} required />
          <input type="text" name="direccion" placeholder="Dirección" onChange={handleChange} required />
          <input type="text" name="Dto" placeholder="Departamento / Casa / Letra" onChange={handleChange} required />
          <input type="text" name="comuna" placeholder="Comuna" onChange={handleChange} required />
          <input type="tel" name="telefono" placeholder="Teléfono" onChange={handleChange} required />
          <input type="email" name="correo" placeholder="Correo electrónico" onChange={handleChange} required />

          <select name="tramo" onChange={handleChange} required>
            <option value="">Selecciona Tramo Horario</option>
            <option value="mañana">Mañana (9:00 - 13:00)</option>
            <option value="tarde">Tarde (13:00 - 17:00)</option>
          </select>

          <select name="servicio" onChange={handleChange} required>
            <option value="">Tipo de servicio</option>
            <option value="Detección De Fuga De Gas">Detección De Fuga De Gas</option>
            <option value="Mantención De Calefón">Mantención De Calefón</option>
            <option value="Instalación De Calefón">Instalación De Calefón</option>
            <option value="Mantención De Termo">Mantención De Termo</option>
            <option value="Limpieza De Cañería">Limpieza De Cañería</option>
            <option value="Cambio De Grifería">Cambio De Grifería</option>
            <option value="Instalación De Filtros">Instalación De Filtros</option>
            <option value="Filtro Triple Para Casa">Filtro Triple Para Casa</option>
          </select>

          <button type="submit">Agendar</button>
        </form>
      </div>
    </div>
  );
}

export default App;