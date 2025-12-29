import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent],
  template: `
    <div class="min-h-screen bg-background">
      <app-header></app-header>
      
      <main>
        <!-- Hero Section -->
        <div class="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 py-16 md:py-24">
          <div class="container mx-auto px-4 md:px-6 text-center">
            <h1 class="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Contactez-nous
            </h1>
            <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une question ? Un problème ? Notre équipe est là pour vous aider 24h/24 et 7j/7
            </p>
          </div>
        </div>

        <div class="container mx-auto px-4 md:px-6 py-16">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Contact Info -->
            <div class="lg:col-span-1 space-y-6">
              <!-- Quick Contact Cards -->
              <div class="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <span class="text-2xl">📧</span>
                </div>
                <h3 class="text-lg font-semibold text-foreground mb-2">Email</h3>
                <p class="text-muted-foreground text-sm mb-3">Réponse sous 24h</p>
                <a href="mailto:support@allamishop.ma" class="text-primary hover:underline font-medium">
                  support&#64;allamishop.ma
                </a>
              </div>

              <div class="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div class="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                  <span class="text-2xl">📞</span>
                </div>
                <h3 class="text-lg font-semibold text-foreground mb-2">Téléphone</h3>
                <p class="text-muted-foreground text-sm mb-3">Lun-Ven, 9h-18h</p>
                <a href="tel:+212522000000" class="text-primary hover:underline font-medium">
                  +212 522 00 00 00
                </a>
              </div>

              <div class="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div class="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                  <span class="text-2xl">💬</span>
                </div>
                <h3 class="text-lg font-semibold text-foreground mb-2">Chat en direct</h3>
                <p class="text-muted-foreground text-sm mb-3">Disponible 24/7</p>
                <button class="text-primary hover:underline font-medium flex items-center gap-1">
                  Démarrer un chat
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </button>
              </div>

              <div class="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div class="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
                  <span class="text-2xl">📍</span>
                </div>
                <h3 class="text-lg font-semibold text-foreground mb-2">Adresse</h3>
                <p class="text-muted-foreground text-sm">
                  123 Boulevard Mohammed V<br>
                  Casablanca 20000, Maroc
                </p>
              </div>
            </div>

            <!-- Contact Form -->
            <div class="lg:col-span-2">
              <div class="bg-card border border-border rounded-2xl p-8">
                <h2 class="text-2xl font-bold text-foreground mb-2">Envoyez-nous un message</h2>
                <p class="text-muted-foreground mb-8">Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.</p>

                @if (submitted()) {
                  <div class="text-center py-12">
                    <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                      <svg class="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-foreground mb-2">Message envoyé !</h3>
                    <p class="text-muted-foreground mb-6">Nous vous répondrons dans les plus brefs délais.</p>
                    <button 
                      (click)="resetForm()"
                      class="text-primary hover:underline"
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                } @else {
                  <form (ngSubmit)="submitForm()" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label class="block text-sm font-medium text-foreground mb-2">Prénom *</label>
                        <input
                          type="text"
                          [(ngModel)]="form.firstName"
                          name="firstName"
                          class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Votre prénom"
                          required
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-foreground mb-2">Nom *</label>
                        <input
                          type="text"
                          [(ngModel)]="form.lastName"
                          name="lastName"
                          class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Votre nom"
                          required
                        />
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label class="block text-sm font-medium text-foreground mb-2">Email *</label>
                        <input
                          type="email"
                          [(ngModel)]="form.email"
                          name="email"
                          class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="votre@email.com"
                          required
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-foreground mb-2">Téléphone</label>
                        <input
                          type="tel"
                          [(ngModel)]="form.phone"
                          name="phone"
                          class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="+212 6XX XXX XXX"
                        />
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Sujet *</label>
                      <select
                        [(ngModel)]="form.subject"
                        name="subject"
                        class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      >
                        <option value="">Sélectionnez un sujet</option>
                        <option value="order">Question sur une commande</option>
                        <option value="product">Question sur un produit</option>
                        <option value="return">Retour ou échange</option>
                        <option value="payment">Problème de paiement</option>
                        <option value="partnership">Partenariat</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Numéro de commande (optionnel)</label>
                      <input
                        type="text"
                        [(ngModel)]="form.orderNumber"
                        name="orderNumber"
                        class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="SHP-XXXXXXXX"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Message *</label>
                      <textarea
                        [(ngModel)]="form.message"
                        name="message"
                        rows="5"
                        class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        placeholder="Décrivez votre demande en détail..."
                        required
                      ></textarea>
                    </div>

                    <div class="flex items-start gap-3">
                      <input
                        type="checkbox"
                        [(ngModel)]="form.acceptPrivacy"
                        name="acceptPrivacy"
                        id="acceptPrivacy"
                        class="w-5 h-5 mt-0.5 rounded border-border text-primary focus:ring-primary accent-primary"
                        required
                      />
                      <label for="acceptPrivacy" class="text-sm text-muted-foreground">
                        J'accepte la <a href="#" class="text-primary hover:underline">politique de confidentialité</a>
                        et autorise le traitement de mes données personnelles.
                      </label>
                    </div>

                    <button
                      type="submit"
                      [disabled]="isSubmitting()"
                      class="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      @if (isSubmitting()) {
                        <svg class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                        </svg>
                        Envoi en cours...
                      } @else {
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                        </svg>
                        Envoyer le message
                      }
                    </button>
                  </form>
                }
              </div>
            </div>
          </div>

          <!-- FAQ Section -->
          <div class="mt-16">
            <h2 class="text-2xl font-bold text-foreground text-center mb-8">Questions fréquentes</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              @for (faq of faqs; track faq.question) {
                <div class="bg-card border border-border rounded-xl p-6">
                  <h3 class="font-semibold text-foreground mb-2 flex items-start gap-2">
                    <span class="text-primary">❓</span>
                    {{ faq.question }}
                  </h3>
                  <p class="text-sm text-muted-foreground">{{ faq.answer }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class ContactComponent {
  submitted = signal(false);
  isSubmitting = signal(false);

  form = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    orderNumber: '',
    message: '',
    acceptPrivacy: false
  };

  faqs = [
    { question: 'Comment suivre ma commande ?', answer: 'Connectez-vous à votre compte et accédez à "Mes commandes" pour voir le statut de votre commande et son numéro de suivi.' },
    { question: 'Quels sont les délais de livraison ?', answer: 'Les délais varient selon l\'option choisie : Standard (5-7 jours), Express (2-3 jours), ou le jour même pour certaines zones.' },
    { question: 'Comment retourner un produit ?', answer: 'Vous avez 30 jours pour retourner un produit. Accédez à votre commande et cliquez sur "Retourner" pour obtenir une étiquette de retour gratuite.' },
    { question: 'Les paiements sont-ils sécurisés ?', answer: 'Oui, tous les paiements sont cryptés SSL et nous ne stockons jamais vos informations bancaires. Nous acceptons Visa, Mastercard et PayPal.' }
  ];

  submitForm(): void {
    if (!this.form.firstName || !this.form.email || !this.form.subject || !this.form.message || !this.form.acceptPrivacy) {
      return;
    }

    this.isSubmitting.set(true);
    
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submitted.set(true);
    }, 1500);
  }

  resetForm(): void {
    this.form = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: '',
      orderNumber: '',
      message: '',
      acceptPrivacy: false
    };
    this.submitted.set(false);
  }
}

