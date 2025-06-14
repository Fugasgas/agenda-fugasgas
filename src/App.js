import React, { useRef, useState, useEffect } from 'react';
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
  const [tecnicoAsignado, setTecnicoAsignado] = useState({ nombre: '', email: '' });

  const comunasPermitidas = [
    'providencia', 'ñuñoa', 'la reina', 'peñalolén', 'macul', 'santiago',
    'las condes', 'vitacura', 'lo barnechea', 'maipú', 'la florida',
    'san miguel', 'independencia', 'recoleta'
  ];

  const zonaOriente = ['las condes', 'vitacura', 'lo barnechea', 'la reina', 'ñuñoa', 'providencia'];
  const zonaNorte = ['recoleta', 'independencia', 'santiago'];
  const zonaSur = ['maipú', 'la florida', 'san miguel', 'macul', 'peñalolén'];

  useEffect(() => {
    const comunaNormalizada = comuna.trim().toLowerCase();
    if (zonaOriente.includes(comunaNormalizada)) {
      setTecnicoAsignado({ nombre: 'Pablo Campusano', email: 'pablofugasgas@gmail.com' });
    } else if (zonaNorte.includes(comunaNormalizada)) {
      setTecnicoAsignado({ nombre: 'Alberto Campusano', email: 'betocampu@gmail.com' });
    } else if (zonaSur.includes(comunaNormalizada)) {
      setTecnicoAsignado({ nombre: 'Marcelo Campusano', email: 'marcelocampusanouno@gmail.com' });
    } else {
      setTecnicoAsignado({ nombre: '', email: '' });
    }
  }, [comuna]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(form.current);
    const nombre = formData.get("user_name");
    const direccion = formData.get("direccion");
    const complemento = formData.get("detalle_direccion");
    const email = formData.get("user_email");
    const telefono = formData.get("telefono");
    const servicio = formData.get("servicio");
    const mensaje = formData.get("mensaje");
    const estacionamiento = formData.get("estacionamiento_visitas");

    const comunaNormalizada = comuna.trim().toLowerCase();
    const diaSeleccionado = fecha.getDay();

    if (diaSeleccionado === 0) {
      alert("Los domingos no se realizan visitas. Por favor seleccione otra fecha.");
      return;
    }

    if (diaSeleccionado === 6 && tramo === "14:00 a 18:00") {
      alert("Los sábados solo se trabaja en el tramo de la mañana (9:00 a 13:00).");
      return;
    }

    if (!comunasPermitidas.includes(comunaNormalizada)) {
      if (window.confirm("Comuna no autorizada. ¿Desea contactarnos por WhatsApp?")) {
        window.open("https://wa.me/56999997777", "_blank");
      }
      return;
    }

    const hoy = new Date();
    const esMismoDia = fecha.toDateString() === hoy.toDateString();
    const horaActual = hoy.getHours();

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

    const templateParamsBase = {
      user_name: nombre,
      direccion,
      detalle_direccion: complemento,
      user_email: email,
      telefono,
      servicio,
      mensaje,
      comuna,
      tramo_horario: tramo,
      fecha: fecha.toLocaleDateString('es-CL'),
      tecnico_asignado: tecnicoAsignado.nombre,
      estacionamiento_visitas: estacionamiento
    };

    // Envíos encadenados: Cliente → Técnico → Administrador
    emailjs.send(
      'service_puqsoem',
      'template_7fhj27n',
      { ...templateParamsBase, to_email: email },
      'ckSlrT8yMxEwuREmO'
    ).then(() => {
      return emailjs.send(
        'service_puqsoem',
        'template_7fhj27n',
        { ...templateParamsBase, to_email: tecnicoAsignado.email },
        'ckSlrT8yMxEwuREmO'
      );
    }).then(() => {
      return emailjs.send(
        'service_puqsoem',
        'template_7fhj27n',
        { ...templateParamsBase, to_email: 'fugasgas.cl@gmail.com' },
        'ckSlrT8yMxEwuREmO'
      );
    }).then(() => {
      alert("Reserva enviada con éxito.");
      setTimeout(() => {
        form.current.reset();
        setFecha(new Date());
        setComuna('');
        setTramo('');
        setTecnicoAsignado({ nombre: '', email: '' });
      }, 500);
    }).catch((error) => {
      console.error('Error completo:', error);
      alert("Error técnico: " + error.text);
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
        <input type="text" name="comuna" placeholder="Comuna" value={comuna}
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

        {/* CAMPO NUEVO: Estacionamiento */}
        <select name="estacionamiento_visitas" required>
          <option value="">¿Hay estacionamiento de visitas?</option>
          <option value="Sí">Sí</option>
          <option value="No">No</option>
        </select>

        <input type="hidden" name="fecha" value={fecha.toLocaleDateString('es-CL')} />
        <input type="hidden" name="tecnico_asignado" value={tecnicoAsignado.nombre} />
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