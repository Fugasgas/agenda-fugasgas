import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import './App.css';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import es from 'date-fns/locale/es';
registerLocale('es', es);

export default function App() {
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    dto: '',
    comuna: '',
    telefono: '',
    correo: '',
    fecha: '',
    tramo: '',
    servicio: '',
    mensaje: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const zonasPorTecnico = {
    'pablocampusano0204@gmail.com': ['Ñuñoa', 'Providencia', 'Las Condes', 'Vitacura', 'Peñalolén', 'Macul'],
    'marcelocampusanouno@gmail.com': ['La Florida', 'Puente Alto', 'Peñalolén', 'Ñuñoa', 'Providencia', 'Recoleta'],
    'betocampu@gmail.com': ['Santiago', 'Providencia', 'Ñuñoa', 'Macul', 'Maipú', 'Pudahuel', 'Cerro Navia', 'Recoleta']
  };

  const disponibilidad = {};

  const asignarTecnico = (comuna, fecha, tramo) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    const tecnicosDisponibles = [];

    for (const tecnico in zonasPorTecnico) {
      if (zonasPorTecnico[tecnico].includes(comuna)) {
        const visitas = disponibilidad[fechaStr]?.[tramo]?.[tecnico] || 0;
        if (visitas < 3) {
          tecnicosDisponibles.push({ tecnico, visitas });
        }
      }
    }

    tecnicosDisponibles.sort((a, b) => a.visitas - b.visitas);
    return tecnicosDisponibles[0]?.tecnico || 'fugasgas.cl@gmail.com';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const tecnicoEmail = asignarTecnico(form.comuna, form.fecha, form.tramo);
    const adminEmail = 'fugasgas.cl@gmail.com';

    const tecnicoNombres = {
      'pablocampusano0204@gmail.com': 'Pablo Campusano',
      'marcelocampusanouno@gmail.com': 'Marcelo Campusano',
      'betocampu@gmail.com': 'Alberto Campusano'
    };

    const tecnico_nombre = tecnicoNombres[tecnicoEmail] || 'Equipo Fugas-Gas';

    const commonParams = {
      ...form,
      fecha: form.fecha.toLocaleDateString('es-CL'),
      tecnico_email: tecnicoEmail,
      tecnico_nombre: tecnico_nombre,
      correo_cliente: form.correo,
      dto: form.dto // garantizado para envío
    };

    const serviceID = 'service_puqsoem';
    const templateID = 'template_7fhj27n';
    const userID = 'gncxbnGHgXlEEkbOP';

    emailjs.send(serviceID, templateID, {
      ...commonParams,
      to_email: form.correo,
      to_name: form.nombre,
      reply_to: form.correo
    }, userID);

    emailjs.send(serviceID, templateID, {
      ...commonParams,
      to_email: tecnicoEmail,
      to_name: tecnico_nombre,
      reply_to: form.correo
    }, userID);

    emailjs.send(serviceID, templateID, {
      ...commonParams,
      to_email: adminEmail,
      to_name: 'Administrador Fugas-Gas',
      reply_to: form.correo
    }, userID)
      .then(() => alert('Reserva enviada con éxito'))
      .catch(() => alert('Error al enviar la reserva'));
  };

  return (
    <div className="app-container">
      <div className="form-wrapper">
        <img src="logo.png" alt="Logo Fugas-Gas" className="logo" />
        <h2>Agende su visita</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
          <input type="text" name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} required />
          <input type="text" name="dto" placeholder="Depto / Casa / Letra" value={form.dto} onChange={handleChange} />
          <input type="text" name="comuna" placeholder="Comuna" value={form.comuna} onChange={handleChange} required />
          <input type="tel" name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} required />
          <input type="email" name="correo" placeholder="Correo" value={form.correo} onChange={handleChange} required />

          <div className="calendar-inline">
            <DatePicker
              selected={form.fecha}
              onChange={(date) => setForm({ ...form, fecha: date })}
              inline
              locale="es"
              minDate={new Date()}
              dayClassName={(date) =>
                date.getDay() === 0 ? 'react-datepicker__day--sunday' : undefined
              }
            />
          </div>

          <select name="tramo" value={form.tramo} onChange={handleChange} required>
            <option value="">Seleccione Tramo Horario</option>
            <option value="AM">AM (9:00 - 13:00)</option>
            <option value="PM">PM (14:00 - 18:00)</option>
          </select>

          <select name="servicio" value={form.servicio} onChange={handleChange} required>
            <option value="">Seleccione servicio requerido</option>
            <option value="Mantención De Calefón">Mantención De Calefón</option>
            <option value="Instalación De Calefón">Instalación De Calefón</option>
            <option value="Mantención De Termo">Mantención De Termo</option>
            <option value="Instalación De Termo">Instalación De Termo</option>
            <option value="Limpieza De Cañerías">Limpieza De Cañerías</option>
            <option value="Instalación De Griferías">Instalación De Griferías</option>
            <option value="Detección De Fuga De Gas">Detección De Fuga De Gas</option>
            <option value="Instalación Filtro Calefón">Instalación Filtro Calefón</option>
            <option value="Instalación Filtro Triple Casa">Instalación Filtro Triple Casa</option>
            <option value="Otro">Otro</option>
          </select>

          <textarea
            name="mensaje"
            placeholder="Mensaje para el técnico (opcional)"
            value={form.mensaje}
            onChange={handleChange}
            rows={3}
          />

          <button type="submit">Reservar</button>
        </form>
      </div>

      <div className="footer">
        <a href="https://fugas-gas.cl" target="_blank" rel="noopener noreferrer">
          Desarrollado por fugas-gas.cl™
        </a>
      </div>
    </div>
  );
}