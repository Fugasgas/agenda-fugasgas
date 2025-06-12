import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import './App.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function App() {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    complemento: '',
    comuna: '',
    telefono: '',
    correo: '',
    fecha: new Date(),
    tramo: '',
    servicio: '',
    mensaje: ''
  });

  const comunasNorte = ['Quilicura', 'Conchalí', 'Recoleta', 'Huechuraba', 'Independencia'];
  const comunasOriente = ['Providencia', 'Ñuñoa', 'La Reina', 'Las Condes', 'Vitacura', 'Lo Barnechea'];
  const comunasSur = ['La Florida', 'Puente Alto', 'San Joaquín', 'San Miguel', 'La Cisterna', 'El Bosque', 'San Ramón', 'La Granja'];

  const tecnicoZona = {
    norte: { nombre: 'Alberto', email: 'betocampu@gmail.com' },
    oriente: { nombre: 'Pablo', email: 'pablocampusano0204@gmail.com' },
    sur: { nombre: 'Marcelo', email: 'marcelocampusanouno@gmail.com' }
  };

  const obtenerTecnicoAsignado = (comuna) => {
    if (comunasNorte.includes(comuna)) return tecnicoZona.norte;
    if (comunasOriente.includes(comuna)) return tecnicoZona.oriente;
    if (comunasSur.includes(comuna)) return tecnicoZona.sur;
    return { nombre: 'Sin asignar', email: 'fugasgas.cl@gmail.com' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, fecha: date }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tecnico = obtenerTecnicoAsignado(formData.comuna);

    const templateParams = {
      nombre: formData.nombre,
      direccion: formData.direccion,
      complemento: formData.complemento,
      comuna: formData.comuna,
      telefono: formData.telefono,
      correo: formData.correo,
      fecha: formData.fecha.toLocaleDateString('es-CL'),
      tramo: formData.tramo,
      servicio: formData.servicio,
      mensaje: formData.mensaje,
      tecnico_asignado: tecnico.nombre,
      to_email: tecnico.email
    };

    // Enviar correo al técnico
    emailjs.send('service_puqsoem', 'template_7fhj27n', templateParams, 'ckSlrT8yMxEwuREmO')
      .then(() => {
        console.log('Correo enviado al técnico');
      }, (error) => {
        console.error('Error al enviar al técnico:', error.text);
      });

    // Enviar correo al administrador
    emailjs.send('service_puqsoem', 'template_7fhj27n', {
      ...templateParams,
      to_email: 'fugasgas.cl@gmail.com'
    }, 'ckSlrT8yMxEwuREmO')
      .then(() => {
        alert("Reserva enviada con éxito.");
        setFormData({
          nombre: '',
          direccion: '',
          complemento: '',
          comuna: '',
          telefono: '',
          correo: '',
          fecha: new Date(),
          tramo: '',
          servicio: '',
          mensaje: ''
        });
      }, (error) => {
        console.error('Error al enviar al administrador:', error.text);
        alert("Hubo un error al enviar la reserva.");
      });
  };

  return (
    <div className="app-container">
      <img src="logo.png" alt="Logo" className="logo" />
      <h2>Agenda tu visita</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="nombre" placeholder="Nombre completo" value={formData.nombre} onChange={handleChange} required />
        <input type="text" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} required />
        <input type="text" name="complemento" placeholder="Casa / Dpto / Letra" value={formData.complemento} onChange={handleChange} />
        <input type="text" name="comuna" placeholder="Comuna" value={formData.comuna} onChange={handleChange} required />
        <input type="tel" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} required />
        <input type="email" name="correo" placeholder="Correo electrónico" value={formData.correo} onChange={handleChange} required />
        <div className="calendar-container">
          <DatePicker selected={formData.fecha} onChange={handleDateChange} dateFormat="dd/MM/yyyy" minDate={new Date()} />
        </div>
        <select name="tramo" value={formData.tramo} onChange={handleChange} required>
          <option value="">Seleccione un tramo horario</option>
          <option value="09:00 a 13:00">09:00 a 13:00</option>
          <option value="14:00 a 18:00">14:00 a 18:00</option>
        </select>
        <select name="servicio" value={formData.servicio} onChange={handleChange} required>
          <option value="">Seleccione un servicio</option>
          <option value="Mantención De Calefón">Mantención de calefón</option>
          <option value="Instalación De Calefón">Instalación de calefón</option>
          <option value="Mantención De Termo">Mantención de termo</option>
          <option value="Instalación De Termo">Instalación de termo</option>
          <option value="Limpieza De Cañerías">Limpieza de cañerías</option>
          <option value="Instalación Filtro Calefón">Instalación filtro calefón</option>
          <option value="Instalación Filtro Casa">Instalación filtro casa</option>
          <option value="Reparación fuga De Gas">Reparación fuga de gas</option>
          <option value="otro">Otro</option>
        </select>
        <textarea name="mensaje" placeholder="Mensaje para el técnico" value={formData.mensaje} onChange={handleChange} />
        <button type="submit">Reservar</button>
      </form>
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#555' }}>
        Desarrollado por <a href="https://fugas-gas.cl" target="_blank" rel="noopener noreferrer">fugas-gas.cl™</a>
      </div>
    </div>
  );
}
