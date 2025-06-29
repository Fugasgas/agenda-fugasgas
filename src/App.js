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
  const [mostrarMantencion, setMostrarMantencion] = useState(false);
  const [clienteMantencion, setClienteMantencion] = useState('');
  const [fechaMantencion, setFechaMantencion] = useState(new Date());
  const [comentarioMantencion, setComentarioMantencion] = useState('');
  const [previewReserva, setPreviewReserva] = useState(null);
  const [urlFotoReserva, setUrlFotoReserva] = useState('');

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

  const handleReservaFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewReserva(URL.createObjectURL(file));
      subirFotoBackend(file);
    } else {
      setPreviewReserva(null);
      setUrlFotoReserva('');
    }
  };

  const subirFotoBackend = async (file) => {
    try {
      const formData = new FormData();
      formData.append("foto", file);

      const res = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("✅ Foto subida:", data.url);
      alert("✅ Foto subida correctamente:\n" + data.url);
      setUrlFotoReserva(data.url);
    } catch (error) {
      console.error("Error subiendo la foto:", error);
      alert("❌ Ocurrió un error al subir la foto.");
    }
  };

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

    const templateParams = {
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
      estacionamiento_visitas: estacionamiento,
      url_foto_reserva: urlFotoReserva || ''
    };

    // ✅ ENVÍO A EMAILJS (OBJETO, NO sendForm)
    emailjs.send('service_puqsoem', 'template_7fhj27n', { ...templateParams, to_email: email }, 'ckSlrT8yMxEwuREmO')
      .then(() => emailjs.send('service_puqsoem', 'template_7fhj27n', { ...templateParams, to_email: tecnicoAsignado.email }, 'ckSlrT8yMxEwuREmO'))
      .then(() => emailjs.send('service_puqsoem', 'template_7fhj27n', { ...templateParams, to_email: 'fugasgas.cl@gmail.com' }, 'ckSlrT8yMxEwuREmO'))
      .then(() => {
        alert("Reserva enviada con éxito.");
        setTimeout(() => {
          form.current.reset();
          setFecha(new Date());
          setComuna('');
          setTramo('');
          setTecnicoAsignado({ nombre: '', email: '' });
          setPreviewReserva(null);
          setUrlFotoReserva('');
        }, 500);
      })
      .catch((error) => {
        console.error('Error completo:', error);
        alert("Error técnico: " + error.text);
      });
  };

  const handleMantencionSubmit = (e) => {
    e.preventDefault();

    const data = {
      cliente: clienteMantencion,
      fecha: fechaMantencion.toLocaleDateString('es-CL'),
      comentario: comentarioMantencion
    };

    fetch('https://script.google.com/macros/s/AKfycbymPfZwburGPgraXedlm7uCZ6m9bjlNI-qiCqH7HxHI21nIMXhP9CmhWYCatrMULS-q/exec', {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(() => {
      alert('Mantención registrada');
      setClienteMantencion('');
      setComentarioMantencion('');
      setFechaMantencion(new Date());
    })
    .catch((error) => {
      alert('Error al registrar mantención: ' + error.message);
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
        />
      </div>

      <form ref={form} onSubmit={handleSubmit} className="formulario">
        <input type="text" name="user_name" placeholder="Nombre completo" required />
        <input type="text" name="direccion" placeholder="Dirección" required />
        <input type="text" name="detalle_direccion" placeholder="Casa / Dpto / Letra" required />
        <input type="text" name="comuna" placeholder="Comuna" value={comuna} onChange={(e) => setComuna(e.target.value)} required />
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
        <select name="estacionamiento_visitas" required>
          <option value="">¿Hay estacionamiento de visitas?</option>
          <option value="Sí">Sí</option>
          <option value="No">No</option>
        </select>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px" }}>
          <label style={{ fontWeight: "bold", fontSize: "16px", textAlign: "center", marginBottom: "10px" }}>
            Por favor, agregue foto, si fuese posible.
          </label>
          <button
            type="button"
            onClick={() => document.getElementById("foto_reserva").click()}
            style={{
              backgroundColor: previewReserva ? "#28a745" : "#50bfff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 20px",
              fontSize: "18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "background-color 0.3s ease",
            }}
          >
            <span role="img" aria-label="camera" style={{ fontSize: "40px", lineHeight: "1", transform: "translateY(-9px)" }}>📷</span>
            <span>{previewReserva ? "Foto cargada" : "Tomar Foto"}</span>
          </button>
          <input
            id="foto_reserva"
            type="file"
            style={{ display: "none" }}
            onChange={handleReservaFotoChange}
          />
          {previewReserva && (
            <img src={previewReserva} alt="Foto seleccionada" style={{ width: "250px", marginTop: "10px", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.3)" }} />
          )}
        </div>

        <input type="hidden" name="fecha" value={fecha.toLocaleDateString('es-CL')} />
        <input type="hidden" name="tecnico_asignado" value={tecnicoAsignado.nombre} />
        <input type="hidden" name="url_foto_reserva" value={urlFotoReserva || ''} />
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

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button
          style={{ backgroundColor: '#333', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', border: 'none' }}
          onClick={() => {
            const pass = prompt("🔐 Ingrese la contraseña para uso interno:");
            if (pass === '0980') {
              setMostrarMantencion(true);
            } else {
              alert("Contraseña incorrecta.");
            }
          }}
        >
          🔐 Uso interno técnicos
        </button>
      </div>

      {mostrarMantencion && (
        <form onSubmit={handleMantencionSubmit} className="formulario" style={{ marginTop: '20px' }}>
          <h3 style={{ textAlign: 'center' }}>Registrar próxima mantención</h3>
          <input type="text" placeholder="Nombre del cliente" value={clienteMantencion} onChange={(e) => setClienteMantencion(e.target.value)} required />
          <input type="date" value={fechaMantencion.toISOString().split('T')[0]} onChange={(e) => setFechaMantencion(new Date(e.target.value))} required />
          <textarea placeholder="Comentario" value={comentarioMantencion} onChange={(e) => setComentarioMantencion(e.target.value)} required />
          <button type="submit">Guardar mantención</button>
        </form>
      )}
    </div>
  );
}
