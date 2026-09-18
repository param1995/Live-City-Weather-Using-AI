import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout, tap } from 'rxjs';
interface ChatResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly http = inject(HttpClient);

  private readonly endpoint = 'http://localhost:3001/chat';

  sendMessage(
    message: string,
    threadId: string
  ): Observable<ChatResponse> {

    console.log('Service request:', {
      message,
      threadId,
    });

    return this.http
      .post<ChatResponse>(this.endpoint, {
        message,
        threadId,
      })
      .pipe(
        tap((response) => {
          console.log('Service response:', response);
        }),
        timeout(50_000)
      );
  }
}