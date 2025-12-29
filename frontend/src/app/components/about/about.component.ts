import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="about" class="bg-background py-16 md:py-24 border-t border-border scroll-mt-20">
      <div class="container mx-auto px-4 md:px-6">
        <div class="max-w-4xl mx-auto text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">À Propos de Nous</h2>
          <p class="text-muted-foreground leading-relaxed">
            Chez <span class="font-semibold text-primary">ALLAMI SHOP</span>, nous sommes passionnés par les
            dernières technologies mobiles. Notre mission est de vous offrir une expérience d'achat fluide,
            une sélection premium d'appareils et un service client attentif.
          </p>
        </div>

        <!-- Vision / Mission / Valeurs / Histoire -->
        <div class="grid gap-8 md:grid-cols-2 mb-12">
          <div class="space-y-4 text-sm md:text-base">
            <h3 class="text-xl font-semibold">Notre Vision</h3>
            <p class="text-muted-foreground">
              Être la destination en ligne de référence pour la technologie mobile, en permettant à chacun
              d'accéder à des appareils innovants qui améliorent la vie quotidienne.
            </p>

            <h3 class="text-xl font-semibold mt-6">Notre Mission</h3>
            <p class="text-muted-foreground">
              Proposer une gamme diversifiée de smartphones, tablettes, montres connectées et accessoires
              haut de gamme, avec une expérience d'achat intuitive et un support client réactif.
            </p>

            <h3 class="text-xl font-semibold mt-6">Nos Valeurs</h3>
            <p class="text-muted-foreground">
              La satisfaction client, l'innovation, l'intégrité et l'excellence guident chacune de nos décisions
              et chaque détail de l'expérience <span class="font-semibold">ALLAMI SHOP</span>.
            </p>
          </div>

          <div class="space-y-4 text-sm md:text-base">
            <h3 class="text-xl font-semibold">Notre Histoire</h3>
            <p class="text-muted-foreground">
              Fondé en 2020, <span class="font-semibold">ALLAMI SHOP</span> est né d'une idée simple :
              rendre la technologie mobile de pointe accessible à tous. Partie d'un simple projet académique,
              la plateforme est devenue un démonstrateur complet d'e‑commerce moderne, centré sur l'utilisateur.
            </p>
            <p class="text-muted-foreground">
              Nous croyons qu'un téléphone est plus qu'un appareil&nbsp;: c'est une passerelle vers la connexion,
              la créativité et la productivité. C'est pourquoi nous sélectionnons soigneusement chaque produit
              et concevons une expérience claire, rapide et agréable.
            </p>
          </div>
        </div>

        <!-- Team / Developed by -->
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-8">
            <h3 class="text-2xl font-semibold mb-2">Développé par des Experts</h3>
            <p class="text-muted-foreground text-sm md:text-base">
              Ce site e‑commerce a été conçu et développé par une équipe de développeurs passionnés,
              spécialisés dans les technologies web modernes.
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <!-- Amine Allami -->
            <div class="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                  AA
                </div>
                <div>
                  <h4 class="font-semibold text-lg">Amine Allami</h4>
                  <p class="text-xs text-muted-foreground">Software Engineer • Backend & Architecture</p>
                </div>
              </div>
              <p class="text-sm text-muted-foreground">
                Développeur passionné, spécialisé dans la conception et le développement d'applications
                robustes et évolutives. Maîtrise de Java, Spring Boot, bases de données relationnelles
                et bonnes pratiques (Clean Code, tests, CI/CD) pour livrer des solutions performantes
                et centrées utilisateur.
              </p>
            </div>

            <!-- Abdla(li) Joumal -->
            <div class="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-primary flex items-center justify-center text-primary-foreground font-semibold">
                  AJ
                </div>
                <div>
                  <h4 class="font-semibold text-lg">Abdlali Joumal</h4>
                  <p class="text-xs text-muted-foreground">Frontend Developer • UI/UX & Expérience Client</p>
                </div>
              </div>
              <p class="text-sm text-muted-foreground">
                Spécialiste des interfaces modernes et responsives, avec un focus sur l'expérience
                utilisateur. Maîtrise d'Angular, TypeScript et Tailwind CSS pour créer des interfaces
                élégantes, performantes et alignées sur les besoins métier.
              </p>
            </div>
          </div>

          <div class="mt-10 text-center">
            <p class="text-sm text-muted-foreground mb-4">
              Vous avez un projet de plateforme e‑commerce ou d'application web&nbsp;?
            </p>
            <button class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              Contacter notre équipe
            </button>
          </div>
        </div>
      </div>
    </section>
  `
})
export class AboutComponent {}


