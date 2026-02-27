import { ChangeDetectionStrategy, Component, signal, effect, ElementRef, viewChild, AfterViewInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { animate, stagger, inView } from "motion";

interface Project {
  id: number;
  title: string;
  description: string;
  tech: string[];
  image: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements AfterViewInit {
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);
  contactForm: FormGroup;
  messages = signal<ContactMessage[]>([]);
  
  projects: Project[] = [
    {
      id: 1,
      title: 'E-commerce Minimalista',
      description: 'Uma loja virtual focada em performance e design limpo usando HTML, CSS e JS puro.',
      tech: ['HTML5', 'CSS3', 'JavaScript'],
      image: 'https://picsum.photos/seed/shop/600/400'
    },
    {
      id: 2,
      title: 'Dashboard de Finanças',
      description: 'Visualização de dados financeiros com gráficos interativos e controle de gastos.',
      tech: ['JavaScript', 'Tailwind', 'Chart.js'],
      image: 'https://picsum.photos/seed/data/600/400'
    },
    {
      id: 3,
      title: 'App de Clima Real-time',
      description: 'Aplicação que consome API de clima para mostrar previsões baseadas na localização.',
      tech: ['API Rest', 'JavaScript', 'CSS Grid'],
      image: 'https://picsum.photos/seed/weather/600/400'
    }
  ];

  heroSection = viewChild<ElementRef>('hero');
  projectsSection = viewChild<ElementRef>('projects');
  skillsSection = viewChild<ElementRef>('skills');
  contactSection = viewChild<ElementRef>('contact');

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Load messages from "database" (localStorage)
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const saved = localStorage.getItem('portfolio_messages');
        if (saved) {
          this.messages.set(JSON.parse(saved));
        }
      }
    }, { allowSignalWrites: true });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initAnimations();
    }
  }

  private initAnimations() {
    // Hero animations
    animate(
      ".animate-hero",
      { opacity: [0, 1], y: [50, 0] },
      { duration: 0.8, delay: stagger(0.2), ease: "easeOut" }
    );

    // Scroll reveal animations
    inView(".reveal", (element) => {
      animate(
        element,
        { opacity: [0, 1], y: [30, 0] },
        { duration: 0.6, ease: "easeOut" }
      );
    });

    inView(".reveal-stagger", (element) => {
      const children = element.querySelectorAll(".reveal-item");
      animate(
        children,
        { opacity: [0, 1], scale: [0.9, 1] },
        { duration: 0.5, delay: stagger(0.1) }
      );
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      const newMessage: ContactMessage = {
        id: Date.now().toString(),
        ...this.contactForm.value,
        date: new Date().toISOString()
      };

      const currentMessages = [...this.messages(), newMessage];
      this.messages.set(currentMessages);
      
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('portfolio_messages', JSON.stringify(currentMessages));
        // Open WhatsApp
        this.openWhatsApp(newMessage.name, newMessage.message);
        this.contactForm.reset();
        alert('Mensagem enviada com sucesso! Redirecionando para o WhatsApp...');
      }
    }
  }

  openWhatsApp(name: string, message: string) {
    if (isPlatformBrowser(this.platformId)) {
      const phone = '244925276911';
      const text = encodeURIComponent(`Olá, meu nome é ${name}. ${message}`);
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    }
  }

  scrollTo(id: string) {
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
