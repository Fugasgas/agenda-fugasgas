import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

registerLocale("es", es);

function App() {
  const [fecha, setFecha] = useState(new Date());
  const [comuna, setComuna] = useState('');

  const zonas = {
    oriente: ['Providencia', 'Ñuñoa', 'La Reina', 'Las Condes', 'Vitacura', 'Lo Barnechea', 'Macul', 'Peñalolén'],
    norte: ['Recoleta', 'Huechuraba', 'Quilicura', 'Conchalí', 'Independencia'],
    sur: ['La Florida', 'Puente Alto', 'La Pintana', 'San Joaquín', 'San Miguel', 'La Granja', 'San Ramón', 'El Bosque', 'Pedro Aguirre Cerda'],
  };

  const correosTecnicos = {
    oriente: 'pablocampusano0204@gmail.com',
    norte: 'betocampu@gmail.com',
    sur: 'marcelocampusanouno@gmail.com',
  };

  const asignarTecnico = (comunaSeleccionada) => {
    for (const zona in zonas) {
      if (zonas[zona].includes(comunaSeleccionada)) {
        return correosTecnicos[zona];
      }
    }
    return 'fugasgas.cl@gmail.com';
  };

  const enviarFormulario = (e) => {
    e.preventDefault();
    const form = e.target;
    const tecnicoEmail = asignarTecnico(comuna);

    emailjs.sendForm(
      'service_puqsoem',
      'template_7fhj27n',
      form,
      'ckSlrT8yMxEwuREmO'
    ).then(() => {
      alert("Reserva enviada con éxito.");
      form.reset();
      setFecha(new Date());
      setComuna('');
    }, (error) => {
      console.error('Error al enviar:', error.text);
      alert("Hubo un error al enviar la reserva.");
    });
  };

  return (
    <div className="app-container">
      <img src="logo.png" alt="Logo" className="logo" />
      <h2>Agenda tu visita</h2>
      <form onSubmit={enviarFormulario}>
        <input type="text" name="nombre" placeholder="Nombre completo" required />
        <input type="text" name="direccion" placeholder="Dirección" required />
        <input type="text" name="departamento" placeholder="Casa / Dpto / Letra" />
        <input type="text" name="comuna" placeholder="Comuna" value={comuna} onChange={(e) => setComuna(e.target.value)} required />
        <input type="tel" name="telefono" placeholder="Teléfono" required />
        <input type="email" name="user_email" placeholder="Correo electrónico" required />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <DatePicker
            selected={fecha}
            onChange={(date) => setFecha(date)}
            name="fecha"
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            inline
            locale="es"
          />
        </div>

        <select name="tramo" required>
          <option value="">Seleccione tramo horario</option>
          <option value="09:00 a 13:00">09:00 a 13:00</option>
          <option value="14:00 a 18:00">14:00 a 18:00</option>
        </select>

        <select name="servicio" required>
          <option value="">Seleccione un servicio</option>
          <option value="Mantención De Calefón">Detección de fuga de gas</option>
          <option value="Instalación De Calefón">Reparación por fuga de gas</option>
          <option value="Mantención De Termo">Cambio de flexible de gas</option>
          <option value="Instalación De Termo">Ajuste de cocina o encimera</option>
          <option value="Limpieza De Cañerías">Instalación de cocina o encimera</option>
          <option value="Instalación Filtro Calefón">Certificación SEC</option>
          <option value="Instalación Filtro Casa">Reparación de cañerías de gas</option>
          <option value="otro">Instalación nueva red de gas</option>
        </select>

        <textarea name="mensaje" placeholder="Mensaje para el técnico (opcional)" rows="4"></textarea>

        <button type="submit">Reservar visita</button>
      </form>

      <div className="footer">
        Desarrollado por <a href="https://fugas-gas.cl">fugas-gas.cl™</a>
      </div>
    </div>
  );
}

export default App;