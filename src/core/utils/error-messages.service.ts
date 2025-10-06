import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MessageService {
  private messages: Record<string, { en: string; ar: string }>;

  constructor() {
    this.loadMessages();
  }

  private loadMessages() {
    const filePath = path.join(__dirname, '../../messages.json');
    this.messages = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  getMessage(key: string, lang: string): string {
    if (this.messages[key]) {
      return this.messages[key][lang] || this.messages[key]['en'];
    }
    return key;
  }
}
