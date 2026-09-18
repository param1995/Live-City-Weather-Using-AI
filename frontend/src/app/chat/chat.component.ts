import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from './chat.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  private readonly chatService = inject(ChatService);
  readonly threadId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  messages: ChatMessage[] = [];
  message = '';
  isLoading = false;
  errorMessage = '';

  sendMessage(): void {
    const content = this.message.trim();
    if (!content || this.isLoading) {
      return;
    }

    this.messages.push({ role: 'user', content });
    this.message = '';
    this.errorMessage = '';
    this.isLoading = true;

    this.chatService.sendMessage(content, this.threadId).subscribe({
      next: ({ message }) => {
        this.messages.push({ role: 'assistant', content: message });
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to generate a response. Please try again.';
        this.isLoading = false;
      },
    });
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
