/** Registro de secciones de Ajustes — sidebar, breadcrumb y overview salen de aquí. */

export interface SettingsSection {
  slug: string;
  title: string;
  short: string;
  desc: string;
  icon: string; // nombre de Icon (ArticleBits)
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  { slug: "perfil", title: "Perfil & Cuenta", short: "Perfil", desc: "Identidad, credenciales y seguridad de acceso", icon: "user" },
  { slug: "fuentes", title: "Fuentes de Información", short: "Fuentes", desc: "Gmail, documentos, carpeta Synpulse y suscripciones", icon: "mail" },
  { slug: "intereses", title: "Perfil de Intereses", short: "Intereses", desc: "Qué aprende la IA de ti — transparente y desactivable", icon: "lens" },
  { slug: "notificaciones", title: "Notificaciones", short: "Notificaciones", desc: "Alertas, emails y frecuencia de avisos", icon: "bell" },
  { slug: "tema", title: "Tema Visual", short: "Tema", desc: "Modo claro/oscuro, contraste y tamaño de lectura", icon: "theme" },
  { slug: "privacidad", title: "Privacidad & Datos", short: "Privacidad", desc: "Permisos, exportación GDPR y zona de peligro", icon: "shield" },
  { slug: "integraciones", title: "Integraciones & API", short: "Integraciones", desc: "Broker, servicios conectados y claves de API", icon: "plug" },
  { slug: "facturacion", title: "Facturación & Plan", short: "Facturación", desc: "Tu plan, facturas y método de pago", icon: "card" },
  { slug: "ayuda", title: "Ayuda & Soporte", short: "Ayuda", desc: "FAQs, contacto, documentación y versión", icon: "help" },
];

export function sectionBySlug(slug: string) {
  return SETTINGS_SECTIONS.find((s) => s.slug === slug);
}
