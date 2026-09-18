import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import {ChatService} from '../chatService/chat.service';

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
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly threadId = `${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  messages: ChatMessage[] = [];
  message = '';
  isLoading = false;
  errorMessage = '';

  sendMessage(): void {
    const content = this.message.trim();

    if (!content || this.isLoading) {
      return;
    }

    console.log('1. Sending message:', content);

    this.messages.push({
      role: 'user',
      content,
    });

    this.message = '';
    this.errorMessage = '';
    this.isLoading = true;

    console.log('2. Calling ChatService...');

    this.chatService
      .sendMessage(content, this.threadId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetector.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.messages.push({
            role: 'assistant',
            content: response.message,
          });
          this.changeDetector.detectChanges();
        },
        error: (error) => {
          console.error('Chat request failed:', error);
          this.errorMessage =
            error?.error?.message ||
            'Unable to generate a response. Please try again.';
          this.changeDetector.detectChanges();
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
