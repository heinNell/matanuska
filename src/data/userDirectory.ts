// User directory and helpers for all departments
import { User } from '../types/User';

export const USER_DIRECTORY: User[] = [
  { shortcode: 'H', id: 'HeinNel', name: 'Hein Nel', role: 'Operator', status: 'Active', accessAreas: ['Fuel Management', 'Request', 'Logbook'] },
  { shortcode: 'AM', id: 'AdrianMoyo', name: 'Adrian Moyo', role: 'Operator', status: 'Active', accessAreas: ['Fuel Management', 'Logbook'] },
  { shortcode: 'PK', id: 'PhillimonKwarire', name: 'Phillimon Kwarire', role: 'Operator', status: 'Active', accessAreas: ['Fuel Management', 'Request', 'Logbook'] },
  { shortcode: 'LT', id: 'LucksonTanyanyiwa', name: 'Luckson Tanyanyiwa', role: 'Operator', status: 'Active', accessAreas: ['Fuel Management', 'Logbook'] },
  { shortcode: 'BM', id: 'BiggieMugwa', name: 'Biggie Mugwa', role: 'Operator', status: 'Active', accessAreas: ['Fuel Management', 'Logbook'] },
  { shortcode: 'WM', id: 'WellingtonMusumbu', name: 'Wellington Musumbu', role: 'Operator', status: 'Active', accessAreas: ['Inspection', 'Logbook'] },
  { shortcode: 'DM', id: 'DecideMurahwa', name: 'Decide Murahwa', role: 'Operator', status: 'Active', accessAreas: ['Incident Report', 'Logbook'] },
  { shortcode: 'W', id: 'Workshop', name: 'Workshop', role: 'Technician', email: 'transportmatanuska@gmail.com', status: 'Active', accessAreas: ['All technical modules (full access)'] },
  { shortcode: 'J', id: 'Joshua', name: 'Joshua', role: 'Operator', status: 'Active', accessAreas: ['Inspection', 'Operator Daily Reporting'] },
  { shortcode: 'BM', id: 'Bradley', name: 'Bradley Milner', role: 'Technician', status: 'Active', accessAreas: ['Inspection', 'Operator Daily Reporting'] },
  { shortcode: 'WK', id: 'Witness', name: 'Witness Kajayi', role: 'Technician', status: 'Active', accessAreas: ['Inspection', 'Operator Daily Reporting', 'Labor Code'] },
  { shortcode: 'KR', id: 'Kenneth', name: 'Kenneth Rukweza', role: 'Technician', status: 'Active', accessAreas: ['Inspection', 'Operator Daily Reporting', 'Labor Code'] },
  { shortcode: 'DK', id: 'DoctorKondwani', name: 'Doctor Kondwani', role: 'Operator', status: 'Active', accessAreas: ['Fuel Management', 'Logbook'] },
  { shortcode: 'TV', id: 'TaurayiVherenaisi', name: 'Taurayi Vherenaisi', role: 'Operator', status: 'Active', accessAreas: ['Logbook'] },
  { shortcode: 'CC', id: 'CanaanChipfurutse', name: 'Canaan Chipfurutse', role: 'Operator', status: 'Active', accessAreas: ['Logbook'] },
  { shortcode: 'JB', id: 'JonathanBepete', name: 'Jonathan Bepete', role: 'Operator', status: 'Active', accessAreas: ['Logbook'] },
  { shortcode: 'PF', id: 'PeterFarai', name: 'Peter Farai', role: 'Operator', status: 'Active', accessAreas: ['Logbook'] },
  { shortcode: 'EM', id: 'EnockMukonyerwa', name: 'Enock Mukonyerwa', role: 'Operator', status: 'Active', accessAreas: ['Logbook'] },
  { shortcode: 'LQ', id: 'LovemoreQochiwe', name: 'Lovemore Qochiwe', role: 'Operator', status: 'Active', accessAreas: ['Logbook'] },
  { shortcode: 'AM', id: 'AlecMaocha', name: 'Alec Maocha', role: 'Employee', email: 'alec@matanuska.co.zw', status: 'Active', accessAreas: ['Full (All modules except PO Approval)'] },
  { shortcode: 'PM', id: 'PaulMwanyadza', name: 'Paul Mwanyadza', role: 'Technician', email: 'mwanyadzapaul61@gmail.com', status: 'Active', accessAreas: ['Full (Tech modules + Demand Parts, Tire Inventory)'] },
  { shortcode: 'CJ', id: 'CainJeche', name: 'Cain Jeche', role: 'Sub Admin', email: 'cain@matanuska.co.zw', status: 'Active', accessAreas: ['All modules (Superuser)'] }
];

export const getUserById = (id: string): User | undefined => USER_DIRECTORY.find(user => user.id === id);
export const getUsersByRole = (role: User['role']): User[] => USER_DIRECTORY.filter(user => user.role === role && user.status === 'Active');
export const getTechnicians = (): User[] => getUsersByRole('Technician');
export const getOperators = (): User[] => getUsersByRole('Operator');
