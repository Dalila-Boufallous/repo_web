import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface NoteTask {
  idNote?: number;
  note: string;
  type: 'note' | 'tache';
}
interface Rdv {
  idDimConfirmationRendezVous: number;
  dateRdvConfirme: string; // format ISO "YYYY-MM-DD"
}


@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss']
})
export class AccueilComponent implements OnInit {

notes: NoteTask[] = [];
tasks: NoteTask[] = [];

newNote: string = '';
newTask: string = '';
isUrgent: boolean = false;

showLatest: boolean = true;
  // Pour le calendrier
monthDays: number[] = Array.from({ length: 31 }, (_, i) => i + 1); // jours du mois
confirmedRdvs: String[] = [];
noRdvDays: number[] = [];    // jours sans RDV

// NOUVELLES PROPRIÉTÉS POUR LES POP-UPS
  showSuccessToast: boolean = false;
  successMessage: string = '';
  showConfirmModal: boolean = false;
  itemToDelete: any = null; // Élément (Note/Tâche) en attente de suppression
private apiUrl = 'http://localhost:8081/api/notes'; // ton endpoint backend

constructor(private http: HttpClient) { }



calMonth: number = new Date().getMonth();
calYear: number = new Date().getFullYear();
calendarWeeks: Date[][] = [];
selectedDate: string | null = null;
monthNames: string[] = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
yearRange: number[] = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);
weekdayNames: string[] = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  ngOnInit(): void {
    this.loadData();
    this.loadConfirmedRdvs();
  }

  // Charger toutes les notes et tâches
  loadData(): void {
    this.http.get<NoteTask[]>(this.apiUrl).subscribe(data => {
      this.notes = data.filter(n => n.type === 'note');
      this.tasks = data.filter(t => t.type === 'tache');
    });
  }

// accueil.component.ts
loadConfirmedRdvs(): void {
  this.http.get<Rdv[]>('http://localhost:8081/api/rendezvous') 
    .subscribe(data => {
      // Si l'API renvoie 'YYYY-MM-DD' dans r.dateRdvConfirme
      this.confirmedRdvs = data.map(r => r.dateRdvConfirme); 
      this.buildCalendar();
    });
}


  // Affiche le toast de succès pendant 3 secondes
  showToast(message: string): void {
    this.successMessage = message;
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 3000); 
  }

buildCalendar(): void {
  const daysInMonth = new Date(this.calYear, this.calMonth + 1, 0).getDate();
  let week: (Date | null)[] = [];
  this.calendarWeeks = [];

  for (let i = 1; i <= daysInMonth; i++) {
    // CLÉ : Créer le jour à minuit UTC pour ignorer le fuseau horaire local.
    const day = new Date(Date.UTC(this.calYear, this.calMonth, i)); // <-- UTILISEZ Date.UTC
    
    // Utilisez getUTCDay() si vous avez besoin de déterminer le jour de la semaine
    const dayOfWeek = (day.getUTCDay() + 6) % 7; // lundi = 0

    // ... (le reste de la logique buildCalendar est maintenu)
    if (i === 1) {
      for (let j = 0; j < dayOfWeek; j++) week.push(null);
    }
    week.push(day);
    if (week.length === 7) {
      this.calendarWeeks.push(week);
      week = [];
    }
  }
  // ... (suite pour remplir la dernière semaine)
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    this.calendarWeeks.push(week);
  }
}

isToday(day: Date): boolean {
  const today = new Date();
  return day.getDate() === today.getDate() &&
           day.getMonth() === today.getMonth() &&
           day.getFullYear() === today.getFullYear();
}

formatDate(day: Date): string {
  const year = day.getUTCFullYear();
  const month = ('0' + (day.getUTCMonth() + 1)).slice(-2);
  const date = ('0' + day.getUTCDate()).slice(-2);
  
  return `${year}-${month}-${date}`;
}

selectCalendarDate(day: Date): void {
  this.selectedDate = this.formatDate(day);
  // ici tu peux charger les RDV du jour si besoin
}

prevMonth(): void {
  if (this.calMonth === 0) { this.calMonth = 11; this.calYear--; } 
  else { this.calMonth--; }
}

nextMonth(): void {
  if (this.calMonth === 11) { this.calMonth = 0; this.calYear++; } 
  else { this.calMonth++; }
}



isNoRdv(day: Date): boolean {
  if (!day) return false;
  
  // formatDate doit renvoyer 'YYYY-MM-DD'
  return !this.confirmedRdvs.includes(this.formatDate(day)); 
}


  // Ajouter une nouvelle note
  addNote(): void {
    if (!this.newNote.trim()) return;
    const note: NoteTask = { note: this.newNote, type: 'note' };
    this.http.post<NoteTask>(this.apiUrl, note).subscribe(() => {
      this.newNote = '';
      this.loadData();
      this.showToast('Note enregistrée avec succès !');
    });
    
  }

  // Ajouter une nouvelle tâche
  addTask(): void {
    if (!this.newTask.trim()) return;
    let task: NoteTask = { note: this.newTask, type: 'tache' };
    if (this.isUrgent) {
      task.note = `🔴 ${task.note}`; // simple indicateur urgent
    }
    this.http.post<NoteTask>(this.apiUrl, task).subscribe(() => {
      this.newTask = '';
      this.isUrgent = false;
      this.loadData();
      this.showToast('Tâche ajoutée avec succès !');
    });
  }


editingItemId: number | null = null; // id de la note/tâche en cours d'édition
editingText: string = '';             // texte temporaire pour l'édition

// Début de l'édition inline
startEdit(item: NoteTask): void {
  this.editingItemId = item.idNote!;
  this.editingText = item.note;
}

// Sauvegarder la modification (Note rapide)
saveEdit(item: NoteTask): void {
  if (!this.editingText.trim()) return;
  const updatedItem = { ...item, note: this.editingText };
  this.http.put<NoteTask>(`${this.apiUrl}/${item.idNote}`, updatedItem).subscribe(() => {
    this.editingItemId = null;
    this.loadData();
    this.showToast('Note modifiée avec succès !');
  });
}

// Annuler la modification
cancelEdit(): void {
  this.editingItemId = null;
  this.editingText = '';
}
  // Modifier une note ou tâche (méthode non utilisée mais maintenue)
editItem(item: NoteTask): void {
  const newValue = prompt('Modifier la note / tâche', item.note);
  if (newValue !== null && newValue.trim() !== '') {
    const updatedItem = { ...item, note: newValue };
    this.http.put<NoteTask>(`${this.apiUrl}/${item.idNote}`, updatedItem).subscribe(() => {
      this.loadData();
    });
  }
}

  // Remplacement de deleteItem : affiche la modale de confirmation
  deleteItem(item: any): void {
    this.itemToDelete = item;
    this.showConfirmModal = true;
  }

  // Logique pour l'action "Confirmer la suppression"
  confirmDelete(): void {
    if (this.itemToDelete && this.itemToDelete.idNote) {
      this.http.delete(`${this.apiUrl}/${this.itemToDelete.idNote}`).subscribe({
        next: () => {
          this.loadData();
          this.showToast('Élément supprimé avec succès !');
        },
        error: (err) => {
          console.error('Erreur de suppression:', err);
          this.showToast('Erreur lors de la suppression.');
        }
      });
    }
    this.showConfirmModal = false;
    this.itemToDelete = null;
  }

  // Logique pour l'action "Annuler la suppression"
  cancelDelete(): void {
    this.showConfirmModal = false;
    this.itemToDelete = null;
  }

  // Afficher / masquer les dernières notes et tâches
  toggleLatest(): void {
    this.showLatest = !this.showLatest;
  }

  startEditTask(task: NoteTask): void {
  this.editingItemId = task.idNote!;
  this.editingText = task.note.replace('🔴 ', '');
}

// Sauvegarder la modification (Tâche)
saveEditTask(task: NoteTask): void {
  if (!this.editingText.trim()) return;
  const updatedTask = { ...task, note: (task.note.startsWith('🔴') ? '🔴 ' : '') + this.editingText };
  this.http.put<NoteTask>(`${this.apiUrl}/${task.idNote}`, updatedTask).subscribe(() => {
    this.editingItemId = null;
    this.editingText = '';
    this.loadData();
    this.showToast('Tâche modifiée avec succès !');
  });
}

}
