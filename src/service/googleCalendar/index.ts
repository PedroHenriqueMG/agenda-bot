import { google } from 'googleapis';
import { log } from '#settings';
import ck from 'chalk';

interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  recurrence?: string[];
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
  extendedProperties?: {
    private?: {
      eventType?: string;
      discordUserId?: string;
    };
  };
}

interface GoogleCalendarApiEvent {
    id?: string;
    summary?: string;
    description?: string;
    start?: {
      dateTime?: string;
      date?: string;
      timeZone?: string;
    };
    end?: {
      dateTime?: string;
      date?: string;
      timeZone?: string;
    };
    recurrence?: string[];
    extendedProperties?: {
      private?: {
        eventType?: string;
        discordUserId?: string;
      };
    };
  }

export class GoogleCalendarService {
  private auth: any;
  private calendar: any;
  private isInitialized = false;

  constructor() {
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  private getEnvFilePath(): string {
    const nodeEnv = process.env.NODE_ENV;
    
    if (nodeEnv === 'production') {
      return '.env.prod';
    } else if (nodeEnv === 'development') {
      return '.env.dev';
    } else {
      return '.env';
    }
  }

  async initialize() {
      const tokens = this.loadTokensFromEnv();
      if (tokens) {
        this.auth.setCredentials(tokens);
        this.isInitialized = true;
        return true;
      }
      return false;
    
  }

  private loadTokensFromEnv() {
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const expiryDate = process.env.GOOGLE_TOKEN_EXPIRY;

    if (!accessToken || !refreshToken) {
      return null;
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      scope: process.env.GOOGLE_CALENDAR_URL,
      token_type: 'Bearer',
      expiry_date: expiryDate ? parseInt(expiryDate) : undefined,
    };
  }

  private async saveTokensToEnv(tokens: any) {
    try {
      const fs = await import('fs/promises');
      const envFilePath = this.getEnvFilePath();
      
      let envContent = '';
      try {
        envContent = await fs.readFile(envFilePath, 'utf-8');
        log.info(ck.blue(`Lendo tokens do arquivo: ${envFilePath}`));
      } catch (error) {
        log.warn(ck.yellow(`Arquivo ${envFilePath} não encontrado, criando novo...`));
        envContent = '';
      }

      const lines = envContent.split('\n');
      
      const filteredLines = lines.filter(line => 
        !line.startsWith('GOOGLE_ACCESS_TOKEN=') &&
        !line.startsWith('GOOGLE_REFRESH_TOKEN=') &&
        !line.startsWith('GOOGLE_TOKEN_EXPIRY=')
      );

      const newTokens = [
        `GOOGLE_ACCESS_TOKEN=${tokens.access_token}`,
        `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`,
        `GOOGLE_TOKEN_EXPIRY=${tokens.expiry_date || ''}`,
      ];

      const newEnvContent = [...filteredLines, ...newTokens].join('\n');

      await fs.writeFile(envFilePath, newEnvContent);

      log.success(ck.green(`Tokens salvos no arquivo ${envFilePath} com sucesso`));
    } catch (error) {
      log.error(ck.red(`Erro ao salvar tokens na .env: ${error}`));
    }
  }

  async setCredentials(accessToken: string, refreshToken: string, expiryDate?: number) {
    const tokens = {
      access_token: accessToken,
      refresh_token: refreshToken,
      scope: 'https://www.googleapis.com/auth/calendar',
      token_type: 'Bearer',
      expiry_date: expiryDate,
    };

    this.auth.setCredentials(tokens);
    await this.saveTokensToEnv(tokens);
    this.isInitialized = true;
  }

  private checkInitialization() {
    if (!this.isInitialized) {
      throw new Error('Google Calendar não está inicializado. Use /setup-google-calendar primeiro.');
    }
  }

  async createEvent(eventData: {
    name: string;
    description: string;
    startTime: Date;
    endTime: Date;
    type: 'fixed' | 'monthly';
    discordUserId?: string;
  }): Promise<string | null> {
    this.checkInitialization();

    try {

      const event: GoogleCalendarEvent = {
        summary: eventData.name,
        description: eventData.description,
        start: {
          dateTime: eventData.startTime.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: eventData.endTime.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, 
            { method: 'popup', minutes: 30 }, 
          ],
        },
        extendedProperties: {
          private: {
            eventType: eventData.type,
            discordUserId: eventData.discordUserId,
          },
        },
      };

      if (eventData.type === 'monthly') {
        event.recurrence = ['RRULE:FREQ=MONTHLY'];
      }

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      log.success(ck.green(`Evento criado no Google Agenda: ${eventData.name}`));
      console.log(response.data);
      return response.data.summary;
    } catch (error) {
      log.error(ck.red(`Erro ao criar evento no Google Agenda: ${error}`));
      return null;
    }
  }

  async getEvents(startDate: Date, endDate: Date) {
    this.checkInitialization();

    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 100,
      });

      return response.data.items || [];
    } catch (error) {
      log.error(ck.red(`Erro ao buscar eventos do Google Agenda: ${error}`));
      return [];
    }
  }

  async getTodayEvents() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const events = await this.getEvents(today, tomorrow);
    
    return events.filter((event: GoogleCalendarApiEvent) => {
        if (!event.start?.dateTime) return false;
        const eventDate = new Date(event.start.dateTime);
        return eventDate.toDateString() === today.toDateString();
      });
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    this.checkInitialization();

    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });

      log.success(ck.green(`Evento deletado do Google Agenda: ${eventId}`));
      return true;
    } catch (error) {
      log.error(ck.red(`Erro ao deletar evento do Google Agenda: ${error}`));
      return false;
    }
  }

  generateAuthUrl(): string {
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  async getTokensFromCode(code: string) {
    try {
      const { tokens } = await this.auth.getToken(code);
      return tokens;
    } catch (error) {
      log.error(ck.red(`Erro ao obter tokens: ${error}`));
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.isInitialized;
  }

  async getAllEvents() {
    try {
      const res = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      return null;
    }
  }
}