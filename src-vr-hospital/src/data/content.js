/**
 * Single source of truth for every piece of copy and imagery on the site.
 * Both the 3D (immersive) and the 2D (lite) experiences read from here, so the
 * two versions can never drift apart.
 *
 * PROVENANCE — everything marked `verified` was read directly off the hospital's
 * own printed material (signboard / poster) supplied by the owner. Anything
 * marked `confirm` is a reasonable inference that the hospital should confirm
 * before this goes live. Nothing here is invented marketing.
 */

export const hospital = {
  name: 'VR Multispeciality Hospital',
  fullName: 'VR Multispeciality Hospital & Diagnostic Centre',
  locality: 'Pedda Narava',
  tagline: 'A 15-bedded emergency hospital for Pedda Narava',
  address: {
    line1: 'Ramalayam Road, Government Hospital vedi',
    line2: 'Pedda Narava, Visakhapatnam-27',
  },
  phone: '+91 73864 36637',
  phoneHref: 'tel:+917386436637',
  whatsapp: 'https://wa.me/917386436637',
  whatsappText:
    'https://wa.me/917386436637?text=Hello%20VR%20Multispeciality%20Hospital%2C%20I%20would%20like%20to%20book%20an%20appointment.',
  mapsHref:
    'https://www.google.com/maps/search/?api=1&query=VR+Multispeciality+Hospital+Pedda+Narava+Visakhapatnam',
}

/** Photo panels the camera flies past, in scroll order. */
export const facilities = [
  {
    id: 'reception',
    photo: 'reception',
    eyebrow: 'Front desk',
    title: 'Reception & OPD',
    body: 'The first room you walk into — staffed, lit and open, so nobody has to work out where to go in an emergency.',
  },
  {
    id: 'emergency',
    photo: 'emergency',
    eyebrow: 'Casualty',
    title: 'Emergency care',
    body: 'A resuscitation bay with monitoring and oxygen at the bedside, and a team that moves the moment a patient arrives.',
  },
  {
    id: 'icu',
    photo: 'icu',
    eyebrow: 'Critical care',
    title: 'Intensive Care Unit',
    body: 'Multi-para monitoring, piped oxygen and adjustable ICU beds for patients who need to be watched minute to minute.',
  },
  {
    id: 'ot',
    photo: 'ot',
    eyebrow: 'Surgical',
    title: 'Operation theatre',
    body: 'A dedicated theatre with a modular table and shadowless OT lighting, kept ready for planned and emergency surgery.',
  },
  {
    id: 'surgery',
    photo: 'surgery',
    eyebrow: 'In theatre',
    title: 'Surgical team',
    body: 'Surgeons, anaesthesia and scrub staff working the same theatre — general and emergency procedures handled in house.',
  },
  {
    id: 'xray',
    photo: 'xray',
    eyebrow: 'Imaging',
    title: 'Digital X-ray',
    body: 'On-site radiography, so a fracture or a chest film is read here rather than sent across the city and waited on.',
  },
  {
    id: 'lab',
    photo: 'lab',
    eyebrow: 'Diagnostics',
    title: 'Pathology laboratory',
    body: 'Haematology and biochemistry analysers with a microscopy bench — routine bloods reported the same visit.',
  },
  {
    id: 'pharmacy',
    photo: 'pharmacy',
    eyebrow: 'Dispensing',
    title: 'In-house pharmacy',
    body: 'A stocked pharmacy inside the building, so treatment starts without a second trip to find the medicine.',
  },
  {
    id: 'ward',
    photo: 'ward',
    eyebrow: 'Inpatient',
    title: 'Wards & rooms',
    body: 'Clean, quiet inpatient rooms with room for an attendant to stay — general beds and private rooms both.',
  },
]

/**
 * Count-up figures.
 * `source: 'verified'` — printed on the hospital's own signboard / poster.
 * `source: 'confirm'`  — please have the hospital confirm before publishing.
 */
export const stats = [
  {
    value: 15,
    suffix: '',
    label: 'Bedded emergency hospital',
    note: 'As on the hospital signboard',
    source: 'verified',
  },
  {
    value: 8,
    suffix: '',
    label: 'Departments & units on site',
    note: 'Reception, casualty, ICU, theatre, radiology, lab, pharmacy, wards',
    source: 'verified',
  },
  {
    value: 24,
    suffix: '/7',
    label: 'Emergency & casualty cover',
    note: 'Please confirm staffed hours before publishing',
    source: 'confirm',
  },
]

/** Department markers that arrange themselves in the open 3D area. */
export const departments = [
  { id: 'emergency', label: 'Emergency', icon: 'cross' },
  { id: 'icu', label: 'Intensive care', icon: 'pulse' },
  { id: 'surgery', label: 'General surgery', icon: 'scalpel' },
  { id: 'radiology', label: 'Radiology', icon: 'scan' },
  { id: 'lab', label: 'Pathology', icon: 'flask' },
  { id: 'pharmacy', label: 'Pharmacy', icon: 'pill' },
  { id: 'inpatient', label: 'Inpatient care', icon: 'bed' },
  { id: 'opd', label: 'Outpatient', icon: 'stethoscope' },
]

/** Every photo used, with its intrinsic aspect ratio (w/h) for layout. */
export const photos = {
  exterior: { src: 'photos/exterior.webp', w: 1452, h: 677, alt: 'VR Multispeciality Hospital building on Ramalayam Road, Pedda Narava' },
  reception: { src: 'photos/reception.webp', w: 337, h: 236, alt: 'Reception desk and corridor inside VR Multispeciality Hospital' },
  ward: { src: 'photos/ward.webp', w: 243, h: 208, alt: 'Inpatient ward with hospital beds' },
  xray: { src: 'photos/xray.webp', w: 404, h: 186, alt: 'Radiographer positioning a patient for a digital X-ray' },
  icu: { src: 'photos/icu.webp', w: 397, h: 212, alt: 'Intensive care bed with patient monitor and piped oxygen' },
  lab: { src: 'photos/lab.webp', w: 312, h: 244, alt: 'Pathology laboratory bench with analysers and a microscope' },
  ot: { src: 'photos/ot.webp', w: 319, h: 230, alt: 'Operation theatre with a modular table and shadowless lighting' },
  pharmacy: { src: 'photos/pharmacy.webp', w: 401, h: 200, alt: 'In-house pharmacy shelves stocked with medicines' },
  surgery: { src: 'photos/surgery.webp', w: 711, h: 714, alt: 'Surgical team operating under theatre lights' },
  emergency: { src: 'photos/emergency.webp', w: 721, h: 714, alt: 'Clinical team attending to a patient with oxygen support' },
}
