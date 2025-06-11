import React, { useRef, useState } from 'react';
import emailjs from 'emailjs-com';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

registerLocale('es', es);

export default function App() {
  const form = useRef();
  const [fecha, setFecha] = useState(new Date());
  const [comuna, setComuna] = useState('');
  const [tramo, setTramo] = useState('');

  const comunasPorTecnico = {
    pablo: ["providencia", "las condes", "vitacura", "lo barnechea", "la reina"],
    alberto: ["santiago", "independencia", "recoleta", "ñuñoa", "macul"],
    marcelo: ["la florida", "maipú", "san miguel", "peñalolén"]
  };

  const correosTecnicos = {
    pablo: "pablocampusano0204@gmail.com",
    alberto: "betocampu@gmail.com",
    marcelo: "marcelocampusanouno@gmail.com"
  };

  const obtenerTecnicoAsignado = (comunaIngresada) => {
    const c = comunaIngresada.trim().toLowerCase();
    if (comunasPorTecnico.pablo.includes(c)) return "pablo";
    if (comunasPorTecnico.alberto.includes(c)) return "alberto";
    if (comunasPorTecnico.marcelo.includes(c)) return "marcelo";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const comunaNormalizada = comuna.trim().toLowerCase();
    const tecnicoID = obtenerTecnicoAsignado(comunaNormalizada);
    const tecnicoEmail = tecnicoID ? correosTecnicos[tecnicoID] : null;

    const hoy = new Date();
    const esMismoDia = fecha.toDateString() === hoy.toDateString();
    const horaActual = hoy.getHours();

    if (!tecnicoEmail) {
      if (window.confirm("Comuna no autorizada. ¿Desea contactarnos por WhatsApp?")) {
        window.open("https://wa.me/56999997777", "_blank");
      }
      return;
    }

    if (esMismoDia && tramo === "9:00 a 13:00" && horaActual >= 10) {
      alert("No es posible agendar hoy en el tramo de la mañana. Por favor elija el tramo de la tarde o una fecha posterior.");
      return;
    }

    if (esMismoDia && tramo === "14:00 a 18:00" && horaActual >= 15) {
      const opcion = window.confirm("Ya no es posible agendar hoy en la tarde. ¿Desea agendar para mañana en la mañana?");
      if (opcion) {
        const manana = new Date();
        manana.setDate(hoy.getDate() + 1);
        setFecha(manana);
        setTramo("9:00 a 13:00");
        alert("La fecha se ha ajustado automáticamente para mañana en la mañana. Por favor confirme los datos y vuelva a enviar.");
      } else {
        if (window.confirm("¿Desea contactarnos por WhatsApp o llamarnos directamente?")) {
          window.open("https://wa.me/56999997777", "_blank");
        }
      }
      return;
    }

    const templateParams = {
      user_name: form.current.user_name.value,
      direccion: form.current.direccion.value,
      detalle_direccion: form.current.detalle_direccion.value,
      comuna: form.current.comuna.value,
      user_email: form.current.user_email.value,
      telefono: form.current.telefono.value,
      servicio: form.current.servicio.value,
      tramo_horario: tramo,
      fecha: fecha.toLocaleDateString('es-CL'),
      mensaje: form.current.mensaje.value
    };

    // Envío al técnico (con admin en CCO)
    emailjs.send('service_puqsoem', 'template_7fhj27n', {
      ...templateParams,
      to_email: tecnicoEmail,
      bcc_email: 'fugasgas.cl@gmail.com'
    }, 'ckSlrT8yMxEwuREmO');

    // Envío al administrador directo
    emailjs.send('service_puqsoem', 'template_7fhj27n', {
      ...templateParams,
      to_email: 'fugasgas.cl@gmail.com'
    }, 'ckSlrT8yMxEwuREmO')
      .then(() => {
        alert("Reserva enviada con éxito.");
        form.current.reset();
        setFecha(new Date());
        setComuna('');
        setTramo('');
      })
      .catch((error) => {
        console.error('Error al enviar:', error);
        alert("Hubo un error al enviar la reserva.");
      });
  };

  return (
    <div className="app-container">
      <img src="logo.png" alt="Logo Fugas-Gas" style={{ width: '200px', margin: '20px auto', display: 'block' }} />
      <h2 style={{ textAlign: 'center' }}>Agenda tu visita</h2>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <DatePicker
          selected={fecha}
          onChange={(date) => setFecha(date)}
          dateFormat="dd/MM/yyyy"
          locale="es"
          inline
          calendarStartDay={1}
          minDate={new Date()}
          dayClassName={(date) => {
            const today = new Date();
            if (date.getDay() === 0) return "domingo";
            if (date < today.setHours(0, 0, 0, 0)) return "deshabilitado";
            return undefined;
          }}
        />
      </div>

      <form ref={form} onSubmit={handleSubmit} className="formulario">
        <input type="text" name="user_name" placeholder="Nombre completo" required />
        <input type="text" name="direccion" placeholder="Dirección" required />
        <input type="text" name="detalle_direccion" placeholder="Casa / Dpto / Letra" required />
        <input
          type="text"
          name="comuna"
          placeholder="Comuna"
          value={comuna}
          onChange={(e) => setComuna(e.target.value)}
          required
        />
        <input type="email" name="user_email" placeholder="Correo electrónico" required />
        <input type="tel" name="telefono" placeholder="Teléfono" required />

        <select name="servicio" required>
          <option value="">Seleccione un servicio</option>
          <option value="Mantención De Calefón">Mantención De Calefón</option>
          <option value="Instalación De Calefón">Instalación De Calefón</option>
          <option value="Mantención De Termo">Mantención De Termo</option>
          <option value="Instalación De Termo">Instalación De Termo</option>
          <option value="Limpieza De Cañerías">Limpieza De Cañerías</option>
          <option value="Instalación Filtro Calefón">Instalación Filtro Calefón</option>
          <option value="Instalación Filtro Casa">Instalación Filtro Casa</option>
          <option value="Reparación fuga De Gas">Reparación fuga De Gas</option>
          <option value="otro">Otro</option>
        </select>

        <select name="tramo_horario" value={tramo} onChange={(e) => setTramo(e.target.value)} required>
          <option value="">Seleccione un tramo horario</option>
          <option value="9:00 a 13:00">9:00 a 13:00</option>
          <option value="14:00 a 18:00">14:00 a 18:00</option>
        </select>

        <input type="hidden" name="fecha" value={fecha.toLocaleDateString('es-CL')} />
        <textarea name="mensaje" placeholder="Mensaje para el técnico" style={{ fontFamily: 'sans-serif' }}></textarea>

        <button type="submit">Reservar visita</button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <a href="https://fugas-gas.cl" target="_blank" rel="noopener noreferrer">
          <div style={{ color: 'white', backgroundColor: '#007bff', padding: '10px', borderRadius: '10px', display: 'inline-block' }}>
            Desarrollado por fugas-gas.cl™
          </div>
        </a>
      </div>
    </div>
  );
}