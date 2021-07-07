import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionService {
  private readonly sessionStore: Map<string, string> = new Map();

  createSession(username: string) {
    const sessionId = uuidv4();
    this.sessionStore.set(sessionId, username);
    return sessionId;
  }

  getSession(sessionId: string) {
    return this.sessionStore.get(sessionId);
  }
}
