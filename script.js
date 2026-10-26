const STORAGE_KEY = 'laundry-room-v1';
const DEFAULT_HELPER = 'size';

const clothesGuide = {
  cotton: { label: 'Cotton clothes', temp: 60, note: 'Good for towels, bedding and everyday cotton.' },
  synthetics: { label: 'Synthetics', temp: 40, note: 'Best for gym kits, blends and bright colours.' },
  delicates: { label: 'Delicates', temp: 30, note: 'Gentle wash for wool, silk and lace.' },
};

const machineCatalog = [
  { id: 'washer-1', name: 'Washer 1', sizeKg: 5, type: 'washer', status: 'free', summary: 'Ready to use' },
  { id: 'washer-2', name: 'Washer 2', sizeKg: 7, type: 'washer', status: 'free', summary: 'Ready to use' },
  { id: 'washer-3', name: 'Washer 3', sizeKg: 7, type: 'washer', status: 'in_use', remainingMinutes: 12 },
  { id: 'washer-4', name: 'Washer 4', sizeKg: 17, type: 'washer', status: 'in_use', remainingMinutes: 7 },
  { id: 'washer-5', name: 'Washer 5', sizeKg: 7, type: 'washer', status: 'finished', finishedMinutesAgo: 8, summary: 'Finished – waiting for pickup' },
  { id: 'washer-6', name: 'Washer 6', sizeKg: 17, type: 'washer', status: 'broken', summary: 'Out of order' },
  { id: 'dryer-1', name: 'Dryer 1', sizeKg: 5, type: 'dryer', status: 'free', summary: 'Ready to use' },
  { id: 'dryer-2', name: 'Dryer 2', sizeKg: 7, type: 'dryer', status: 'finished', finishedMinutesAgo: 8, summary: 'Finished – waiting for pickup' },
];

const sampleBookings = [
  {
    id: 'sample-booking-1',
    machineId: 'washer-5',
    date: getDateInDays(0),
    time: getRecentPastTime(8),
    clothesType: 'cotton',
    createdAt: Date.now(),
    status: 'done',
    cache: false,
  },
  {
    id: 'sample-booking-2',
    machineId: 'dryer-2',
    date: getDateInDays(0),
    time: getRecentPastTime(8),
    clothesType: 'delicates',
    createdAt: Date.now() - 1000 * 60 * 5,
    status: 'done',
    cache: false,
  },
];

const state = {
  helper: DEFAULT_HELPER,
  selectedMachineId: null,
  selectedClothesType: 'cotton',
  activeMachineType: null,
  bookings: [],
};

function getDateInDays(offset) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatRelativeTimeFromMinutes(totalMinutes) {
  const minutes = Math.max(1, Math.round(totalMinutes));

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} h ago`;
  }

  const days = Math.round(hours / 24);
  if (days === 1) {
    return 'yesterday';
  }

  return `${days} d ago`;
}

function getRecentPastTime(minutesAgo) {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutesAgo);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getCurrentLocalTimeValue() {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function safeLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function initialiseStorage() {
  const existing = safeLoad();
  const today = getDateInDays(0);
  const hasTodayBookings = Array.isArray(existing?.bookings) && existing.bookings.some((booking) => booking.date === today);

  if (existing && Array.isArray(existing.machines) && Array.isArray(existing.bookings) && hasTodayBookings) {
    state.bookings = existing.bookings;
    return existing.machines;
  }

  state.bookings = sampleBookings;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ machines: machineCatalog, bookings: sampleBookings }));
  return machineCatalog;
}

function getMachines() {
  const saved = safeLoad();
  if (saved && Array.isArray(saved.machines)) {
    return saved.machines;
  }
  return initialiseStorage();
}

function persistMachines(machines) {
  const saved = safeLoad();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ machines, bookings: saved ? saved.bookings : state.bookings }));
}

function persistBookings() {
  const machines = getMachines();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ machines, bookings: state.bookings }));
}

function getMachineStatusLabel(machine) {
  if (machine.status === 'free') {
    return 'Free';
  }

  if (machine.status === 'in_use') {
    return 'In use';
  }

  if (machine.status === 'finished') {
    return 'Finished';
  }

  if (machine.status === 'broken') {
    return 'Broken';
  }

  return 'Ready';
}

function getRelativeStatus(machine) {
  if (machine.status === 'free') {
    return 'Free now';
  }

  if (machine.status === 'broken') {
    return '';
  }

  if (machine.status === 'in_use') {
    const minutesLeft = Number(machine.remainingMinutes || 0);
    if (minutesLeft > 0) {
      return `Finishes in ${minutesLeft} min`;
    }
    return 'Finished 5 min ago';
  }

  if (machine.status === 'finished') {
    const minutesAgo = Number(machine.finishedMinutesAgo || machine.remainingMinutes || 0);
    if (minutesAgo > 0) {
      return `Finished ${formatRelativeTimeFromMinutes(minutesAgo)}`;
    }
    return 'Finished – waiting for pickup';
  }

  return machine.summary || 'Ready';
}

function getBookingStatusText(booking) {
  const startAt = new Date(`${booking.date}T${booking.time}:00`);
  const now = new Date();
  const diffMinutes = Math.round((startAt - now) / 60000);

  if (diffMinutes > 0) {
    return `Booked for ${formatTime(booking.time)} today`;
  }

  return 'Your laundry is done, please collect it';
}

function formatTime(value) {
  if (!value) return '—';
  const [hours, minutes] = value.split(':');
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
}

function ensureBookingState() {
  const now = Date.now();
  state.bookings = (safeLoad()?.bookings || sampleBookings).map((booking) => {
    if (booking.status === 'done') {
      return booking;
    }

    const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
    const isDone = bookingDateTime.getTime() <= now;
    return {
      ...booking,
      status: isDone ? 'done' : 'scheduled',
    };
  });
}

function syncMachineStateFromBookings() {
  const machines = getMachines();

  machines.forEach((machine) => {
    if (machine.status === 'broken') {
      return;
    }

    const booking = state.bookings.find((entry) => entry.machineId === machine.id && entry.status === 'done');
    if (booking) {
      machine.status = 'finished';
      machine.summary = 'Finished – waiting for pickup';
      machine.remainingMinutes = 0;
      machine.finishedMinutesAgo = Math.max(1, Math.round((Date.now() - new Date(`${booking.date}T${booking.time}:00`).getTime()) / 60000));
      return;
    }

    if (machine.status === 'finished') {
      machine.status = 'free';
      machine.summary = 'Ready to use';
      machine.remainingMinutes = 0;
      delete machine.finishedMinutesAgo;
    }
  });

  persistMachines(machines);
}

function saveState() {
  const machines = getMachines();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ machines, bookings: state.bookings }));
}

function getMachineTypeSummary(type) {
  const machines = getMachines().filter((machine) => machine.type === type);
  const counts = { free: 0, in_use: 0, finished: 0, broken: 0 };

  machines.forEach((machine) => {
    if (counts[machine.status] !== undefined) {
      counts[machine.status] += 1;
    }
  });

  const parts = [];
  Object.entries({ free: 'free', in_use: 'in use', finished: 'finished', broken: 'broken' }).forEach(([status, label]) => {
    if (counts[status]) {
      parts.push(`${counts[status]} ${label}`);
    }
  });

  return parts.join(' · ') || '0 free';
}

function renderMachineGrid() {
  const grid = document.getElementById('machineGrid');
  const machines = getMachines();
  grid.innerHTML = '';

  if (!state.activeMachineType) {
    const categories = ['washer', 'dryer'];

    categories.forEach((type) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'machine-type-button';
      button.dataset.machineType = type;
      button.innerHTML = `
        <span class="machine-type-title">${type === 'washer' ? 'Washers' : 'Dryers'}</span>
        <span class="machine-type-summary">${getMachineTypeSummary(type)}</span>
      `;

      button.addEventListener('click', () => {
        state.activeMachineType = type;
        renderMachineGrid();
      });

      grid.appendChild(button);
    });

    return;
  }

  const visibleMachines = machines.filter((machine) => machine.type === state.activeMachineType);
  const title = state.activeMachineType === 'washer' ? 'Washers' : 'Dryers';

  const header = document.createElement('div');
  header.className = 'machine-list-header';
  header.innerHTML = `
    <button class="secondary-button" type="button" data-back-to-home>Back</button>
    <span class="machine-list-title">${title}</span>
  `;
  grid.appendChild(header);

  const backButton = header.querySelector('[data-back-to-home]');
  backButton.addEventListener('click', () => {
    state.activeMachineType = null;
    renderMachineGrid();
  });

  visibleMachines.forEach((machine) => {
    const card = document.createElement('article');
    card.className = 'machine-card';
    card.dataset.status = machine.status;

    const statusText = getRelativeStatus(machine);
    const machineStatus = getMachineStatusLabel(machine);

    card.innerHTML = `
      <div class="machine-top">
        <span class="machine-name">${machine.name}</span>
        <span class="machine-size">${machine.sizeKg}kg</span>
      </div>
      <div class="machine-visual" aria-hidden="true"></div>
      <div class="machine-status">
        <span class="status-pill">${machineStatus}</span>
        <span class="machine-info">${statusText || ''}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      if (machine.status !== 'free') {
        return;
      }
      openBookingModal(machine.id);
    });

    grid.appendChild(card);
  });
}

function renderHelperPanel() {
  const content = document.getElementById('helperContent');
  const helper = state.helper;

  document.querySelectorAll('.helper-tab').forEach((button) => {
    button.classList.toggle('active', button.dataset.helper === helper);
  });

  if (helper === 'size') {
    content.innerHTML = `
      <div class="helper-list">
        <div class="helper-item">
          <strong>Small load</strong>
          <small>Best for 5 kg machines. Good for a few clothes or a light wash.</small>
        </div>
        <div class="helper-item">
          <strong>Medium load</strong>
          <small>Use a 7 kg machine for a standard week of clothes or bedding.</small>
        </div>
        <div class="helper-item">
          <strong>Large load</strong>
          <small>Pick a 17 kg machine for blankets, towels and big family loads.</small>
        </div>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="helper-list">
      ${Object.entries(clothesGuide)
        .map(
          ([key, value]) => `
            <div class="helper-item">
              <strong>${value.label}</strong>
              <small>${value.temp}°C — ${value.note}</small>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderBookingSection() {
  const container = document.getElementById('bookingSection');
  const activeBookings = state.bookings.filter((booking) => booking.status === 'scheduled' || booking.status === 'done');

  if (!activeBookings.length) {
    container.classList.remove('visible');
    container.innerHTML = '';
    return;
  }

  const latestBooking = activeBookings[activeBookings.length - 1];
  const machine = getMachines().find((current) => current.id === latestBooking.machineId) || { name: 'Machine', sizeKg: '' };
  const details = clothesGuide[latestBooking.clothesType] || clothesGuide.cotton;
  const tempLabel = `${details.label}: ${details.temp}°C`;

  container.classList.add('visible');
  container.innerHTML = `
   <div class="booking-card booking-confirmation">
     <div class="booking-header-row">
       <span class="booking-label">My booking</span>
     </div>
     <h3 class="booking-confirmation-title">✓ Booked!</h3>
     <div class="booking-detail-list">
       <div class="booking-detail-item">
         <span>Machine</span>
         <strong>${machine.name} · ${machine.sizeKg}kg</strong>
       </div>
       <div class="booking-detail-item">
         <span>Date</span>
         <strong>${formatDate(latestBooking.date)}</strong>
       </div>
       <div class="booking-detail-item">
         <span>Time</span>
         <strong>${formatTime(latestBooking.time)}</strong>
       </div>
       <div class="booking-detail-item">
         <span>Clothes</span>
         <strong>${details.label}</strong>
       </div>
       <div class="booking-detail-item">
         <span>Suggested temp</span>
         <strong>${details.temp}°C</strong>
       </div>
     </div>
     <p class="booking-confirmation-copy">We'll remind you when your washing is done.</p>
     <div class="booking-actions confirmation-actions">
       <button class="primary-button" type="button" data-booking-done>Done</button>
       <button class="cancel-button" type="button" data-cancel-booking="${latestBooking.id}">Cancel booking</button>
     </div>
   </div>
  `;

  const cancelButton = container.querySelector('[data-cancel-booking]');
  if (cancelButton) {
    cancelButton.addEventListener('click', () => cancelBooking(latestBooking.id));
  }

  const doneButton = container.querySelector('[data-booking-done]');
  if (doneButton) {
    doneButton.addEventListener('click', () => {
      state.activeMachineType = null;
      render();
    });
  }
}

function bookingInfo(booking) {
  const details = clothesGuide[booking.clothesType] || clothesGuide.cotton;
  return {
    text: `${details.label} · ${details.temp}°C`,
  };
}

function openBookingModal(machineId) {
  state.selectedMachineId = machineId;
  const modal = document.getElementById('bookingModal');
  const machineSelect = document.getElementById('machineSelect');
  const clothesOptions = document.getElementById('clothesOptions');
  const dateInput = document.getElementById('bookingDate');
  const timeInput = document.getElementById('bookingTime');
  const tempHelp = document.getElementById('temperatureHelp');

  const freeMachines = getMachines().filter((machine) => machine.status === 'free');
  const selectedMachine = freeMachines.find((machine) => machine.id === machineId) || freeMachines[0];
  state.selectedMachineId = selectedMachine ? selectedMachine.id : null;

  machineSelect.innerHTML = freeMachines
    .map(
      (machine) => `
        <button class="choice-chip ${machine.id === state.selectedMachineId ? 'selected' : ''}" type="button" data-machine-chip="${machine.id}">
          ${machine.name} · ${machine.sizeKg}kg
        </button>
      `,
    )
    .join('');

  machineSelect.querySelectorAll('[data-machine-chip]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedMachineId = button.dataset.machineChip;
      openBookingModal(state.selectedMachineId);
    });
  });

  const date = getDateInDays(0);
  const currentTime = getCurrentLocalTimeValue();
  dateInput.value = date;
  timeInput.value = currentTime;

  clothesOptions.innerHTML = Object.entries(clothesGuide)
    .map(
      ([key, value]) => `
        <button class="choice-chip ${state.selectedClothesType === key ? 'selected' : ''}" type="button" data-clothes-chip="${key}">
          ${value.label}
        </button>
      `,
    )
    .join('');

  clothesOptions.querySelectorAll('[data-clothes-chip]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedClothesType = button.dataset.clothesChip;
      updateTemperatureSuggestion();
      renderClothesOptions();
    });
  });

  updateTemperatureSuggestion();
  renderClothesOptions();

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function renderClothesOptions() {
  const clothesOptions = document.getElementById('clothesOptions');
  clothesOptions.querySelectorAll('[data-clothes-chip]').forEach((button) => {
    button.classList.toggle('selected', button.dataset.clothesChip === state.selectedClothesType);
  });
}

function updateTemperatureSuggestion() {
  const tempHelp = document.getElementById('temperatureHelp');
  const selected = clothesGuide[state.selectedClothesType] || clothesGuide.cotton;
  tempHelp.innerHTML = `${selected.label}: ${selected.temp}°C`;
}

function closeBookingModal() {
  document.getElementById('bookingModal').classList.add('hidden');
  document.getElementById('bookingModal').setAttribute('aria-hidden', 'true');
}

function confirmBooking() {
  const date = document.getElementById('bookingDate').value;
  const time = document.getElementById('bookingTime').value;

  if (!state.selectedMachineId || !date || !time) {
    return;
  }

  const booking = {
    id: `booking-${Date.now()}`,
    machineId: state.selectedMachineId,
    date,
    time,
    clothesType: state.selectedClothesType,
    createdAt: Date.now(),
    status: 'scheduled',
  };

  state.bookings.push(booking);
  saveState();

  const machines = getMachines();
  const machineIndex = machines.findIndex((machine) => machine.id === state.selectedMachineId);
  if (machineIndex !== -1) {
    machines[machineIndex].status = 'in_use';
    machines[machineIndex].summary = 'Booked';
    machines[machineIndex].remainingMinutes = 45;
    persistMachines(machines);
  }

  closeBookingModal();
  render();
}

function cancelBooking(bookingId) {
  const bookingIndex = state.bookings.findIndex((booking) => booking.id === bookingId);
  if (bookingIndex !== -1) {
    const booking = state.bookings[bookingIndex];
    const machines = getMachines();
    const machine = machines.find((currentMachine) => currentMachine.id === booking.machineId);
    if (machine) {
      machine.status = 'free';
      machine.summary = 'Ready to use';
      machine.remainingMinutes = 0;
      persistMachines(machines);
    }
    state.bookings.splice(bookingIndex, 1);
    saveState();
    render();
  }
}

function attachEvents() {
  document.getElementById('bookSlotButton').addEventListener('click', () => {
    const freeMachines = getMachines().filter((machine) => machine.status === 'free');
    if (freeMachines.length) {
      openBookingModal(freeMachines[0].id);
      return;
    }
    openBookingModal(getMachines()[0].id);
  });

  document.getElementById('closeModalButton').addEventListener('click', closeBookingModal);
  document.getElementById('cancelBookingButton').addEventListener('click', closeBookingModal);
  document.getElementById('confirmBookingButton').addEventListener('click', confirmBooking);
  document.getElementById('refreshButton').addEventListener('click', () => {
    render();
  });

  document.querySelectorAll('.helper-tab').forEach((button) => {
    button.addEventListener('click', () => {
      state.helper = button.dataset.helper;
      renderHelperPanel();
    });
  });
}

function render() {
  ensureBookingState();
  syncMachineStateFromBookings();
  renderMachineGrid();
  renderHelperPanel();
  renderBookingSection();
}

function bootstrap() {
  initialiseStorage();
  attachEvents();
  render();
}

bootstrap();
