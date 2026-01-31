// import { useAppStore } from '@/store/useAppStore';

// type MessageHandler = (data: unknown) => void;

// class WebSocketService {
//   private ws: WebSocket | null = null;
//   private reconnectAttempts = 0;
//   private maxReconnectAttempts = 5;
//   private reconnectTimeout: number | null = null;
//   private messageHandlers: Map<string, MessageHandler[]> = new Map();
//   private url: string = '';

//   connect(url: string) {
//     this.url = url;
//     this.createConnection();
//   }

//   private createConnection() {
//     if (this.ws?.readyState === WebSocket.OPEN) {
//       return;
//     }

//     try {
//       this.ws = new WebSocket(this.url);

//       this.ws.onopen = () => {
//         console.log('[WS] Connected');
//         useAppStore.getState().setConnected(true);
//         this.reconnectAttempts = 0;
        
//         useAppStore.getState().addLog({
//           timestamp: new Date(),
//           level: 'info',
//           message: 'WebSocket connection established',
//           source: 'WebSocket',
//         });
//       };

//       this.ws.onclose = (event) => {
//         console.log('[WS] Disconnected:', event.code, event.reason);
//         useAppStore.getState().setConnected(false);
        
//         useAppStore.getState().addLog({
//           timestamp: new Date(),
//           level: 'warning',
//           message: `WebSocket disconnected: ${event.reason || 'Connection closed'}`,
//           source: 'WebSocket',
//         });

//         this.attemptReconnect();
//       };

//       this.ws.onerror = (error) => {
//         console.error('[WS] Error:', error);
        
//         useAppStore.getState().addLog({
//           timestamp: new Date(),
//           level: 'error',
//           message: 'WebSocket error occurred',
//           source: 'WebSocket',
//         });
//       };

//       this.ws.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
//           this.handleMessage(data);
//         } catch {
//           // Handle plain text messages (streaming)
//           this.handleStreamingMessage(event.data);
//         }
//       };
//     } catch (error) {
//       console.error('[WS] Connection error:', error);
//       this.attemptReconnect();
//     }
//   }

//   private handleMessage(data: { type: string; payload: unknown }) {
//     const { type, payload } = data;
//     const store = useAppStore.getState();

//     switch (type) {
//       case 'system_state':
//         const statePayload = payload as { state: 'normal' | 'alert' | 'critical' | 'offline'; confidence: number };
//         store.setSystemState(statePayload.state);
//         store.setConfidence(statePayload.confidence);
//         break;

//       case 'activity':
//         const activityPayload = payload as { type: 'keyboard' | 'mouse' | 'eye_tracking' | 'inference' | 'tool' | 'system'; action: string; details?: string };
//         store.addActivity({
//           timestamp: new Date(),
//           type: activityPayload.type,
//           action: activityPayload.action,
//           details: activityPayload.details,
//         });
//         store.addActivityMetric(1);
//         break;

//       case 'log':
//         const logPayload = payload as { level: 'info' | 'warning' | 'error' | 'debug'; message: string; source?: string };
//         store.addLog({
//           timestamp: new Date(),
//           level: logPayload.level,
//           message: logPayload.message,
//           source: logPayload.source,
//         });
//         break;

//       case 'inference':
//         const inferencePayload = payload as { model: string; confidence: number; decision: string; tokens?: number; latency?: number };
//         store.addInference({
//           timestamp: new Date(),
//           model: inferencePayload.model,
//           confidence: inferencePayload.confidence,
//           decision: inferencePayload.decision,
//           tokens: inferencePayload.tokens,
//           latency: inferencePayload.latency,
//         });
//         break;

//       case 'stream_start':
//         store.clearStreamingText();
//         store.setStreaming(true);
//         break;

//       case 'stream_token':
//         const tokenPayload = payload as { token: string };
//         store.appendStreamingText(tokenPayload.token);
//         break;

//       case 'stream_end':
//         store.setStreaming(false);
//         break;

//       default:
//         // Pass to registered handlers
//         const handlers = this.messageHandlers.get(type);
//         if (handlers) {
//           handlers.forEach((handler) => handler(payload));
//         }
//     }
//   }

//   private handleStreamingMessage(text: string) {
//     const store = useAppStore.getState();
//     if (store.isStreaming) {
//       store.appendStreamingText(text);
//     }
//   }

//   private attemptReconnect() {
//     if (this.reconnectAttempts >= this.maxReconnectAttempts) {
//       console.log('[WS] Max reconnection attempts reached');
//       useAppStore.getState().addLog({
//         timestamp: new Date(),
//         level: 'error',
//         message: 'Max reconnection attempts reached. Please refresh the page.',
//         source: 'WebSocket',
//       });
//       return;
//     }

//     const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
//     this.reconnectAttempts++;

//     console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
//     this.reconnectTimeout = window.setTimeout(() => {
//       this.createConnection();
//     }, delay);
//   }

//   send(type: string, payload: unknown) {
//     if (this.ws?.readyState === WebSocket.OPEN) {
//       this.ws.send(JSON.stringify({ type, payload }));
//     } else {
//       console.warn('[WS] Cannot send message - not connected');
//     }
//   }

//   subscribe(type: string, handler: MessageHandler) {
//     if (!this.messageHandlers.has(type)) {
//       this.messageHandlers.set(type, []);
//     }
//     this.messageHandlers.get(type)!.push(handler);

//     return () => {
//       const handlers = this.messageHandlers.get(type);
//       if (handlers) {
//         const index = handlers.indexOf(handler);
//         if (index > -1) {
//           handlers.splice(index, 1);
//         }
//       }
//     };
//   }

//   disconnect() {
//     if (this.reconnectTimeout) {
//       clearTimeout(this.reconnectTimeout);
//     }
//     if (this.ws) {
//       this.ws.close();
//       this.ws = null;
//     }
//   }

//   get isConnected() {
//     return this.ws?.readyState === WebSocket.OPEN;
//   }
// }

// export const wsService = new WebSocketService();

// import { useAppStore } from '@/store/useAppStore';

// type MessageHandler = (data: unknown) => void;

// class WebSocketService {
//   private ws: WebSocket | null = null;
//   private reconnectAttempts = 0;
//   private maxReconnectAttempts = 5;
//   private reconnectTimeout: number | null = null;
//   private messageHandlers: Map<string, MessageHandler[]> = new Map();
//   private url: string = '';

//   // ===============================
//   // CONNECT
//   // ===============================
//   connect(url: string) {
//     this.url = url;
//     this.createConnection();
//   }

//   private createConnection() {
//     if (this.ws?.readyState === WebSocket.OPEN) return;

//     try {
//       this.ws = new WebSocket(this.url);

//       this.ws.onopen = () => {
//         console.log('[WS] Connected');
//         const store = useAppStore.getState();

//         store.setConnected(true);
//         this.reconnectAttempts = 0;

//         store.addLog({
//           timestamp: new Date(),
//           level: 'info',
//           message: 'WebSocket connection established',
//           source: 'WebSocket',
//         });
//       };

//       this.ws.onclose = (event) => {
//         console.log('[WS] Disconnected:', event.code, event.reason);
//         const store = useAppStore.getState();

//         store.setConnected(false);
//         store.addLog({
//           timestamp: new Date(),
//           level: 'warning',
//           message: `WebSocket disconnected: ${event.reason || 'Connection closed'}`,
//           source: 'WebSocket',
//         });

//         this.attemptReconnect();
//       };

//       this.ws.onerror = () => {
//         const store = useAppStore.getState();

//         store.addLog({
//           timestamp: new Date(),
//           level: 'error',
//           message: 'WebSocket error occurred',
//           source: 'WebSocket',
//         });
//       };

//       // ===============================
//       // MESSAGE HANDLER (FIXED FOR YOUR BACKEND)
//       // ===============================
//       this.ws.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);

//           // 🔴 Backend sends RAW inference payload
//           // We normalize it to { type, payload }
//           this.handleMessage({
//             type: 'inference',
//             payload: data,
//           });
//         } catch {
//           this.handleStreamingMessage(event.data);
//         }
//       };

//     } catch (error) {
//       console.error('[WS] Connection error:', error);
//       this.attemptReconnect();
//     }
//   }

//   // ===============================
//   // MESSAGE ROUTER
//   // ===============================
//   private handleMessage(data: { type: string; payload: unknown }) {
//     const { type, payload } = data;
//     const store = useAppStore.getState();

//     switch (type) {
//       case 'inference': {
//         /**
//          * Backend payload shape:
//          * {
//          *   label_id: number,
//          *   label_name: string,
//          *   confidence: number,
//          *   features: object,
//          *   proba: number[],
//          *   history: { time: number; label: number }[]
//          * }
//          */
//         const p = payload as {
//           label_id: number;
//           label_name: string;
//           confidence: number;
//           history: { time: number; label: number }[];
//         };

//         store.addInference({
//           timestamp: new Date(),
//           model: 'CognitiveSense-RF',
//           confidence: p.confidence ?? 0,
//           decision: p.label_name,
//         });

//         store.setConfidence(p.confidence ?? 0);

//         store.setSystemState(
//           p.label_name === 'Normal' ? 'normal' : 'alert'
//         );

//         break;
//       }

//       default: {
//         const handlers = this.messageHandlers.get(type);
//         if (handlers) {
//           handlers.forEach((handler) => handler(payload));
//         }
//       }
//     }
//   }

//   // ===============================
//   // STREAMING TEXT (SAFE)
//   // ===============================
//   private handleStreamingMessage(text: string) {
//     const store = useAppStore.getState();
//     if (store.isStreaming) {
//       store.appendStreamingText(text);
//     }
//   }

//   // ===============================
//   // RECONNECT LOGIC
//   // ===============================
//   private attemptReconnect() {
//     if (this.reconnectAttempts >= this.maxReconnectAttempts) {
//       useAppStore.getState().addLog({
//         timestamp: new Date(),
//         level: 'error',
//         message: 'Max reconnection attempts reached. Please refresh the page.',
//         source: 'WebSocket',
//       });
//       return;
//     }

//     const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
//     this.reconnectAttempts++;

//     console.log(`[WS] Reconnecting in ${delay}ms`);

//     this.reconnectTimeout = window.setTimeout(() => {
//       this.createConnection();
//     }, delay);
//   }

//   // ===============================
//   // SEND (OPTIONAL – UNUSED NOW)
//   // ===============================
//   send(type: string, payload: unknown) {
//     if (this.ws?.readyState === WebSocket.OPEN) {
//       this.ws.send(JSON.stringify({ type, payload }));
//     }
//   }

//   // ===============================
//   // SUBSCRIBE (OPTIONAL)
//   // ===============================
//   subscribe(type: string, handler: MessageHandler) {
//     if (!this.messageHandlers.has(type)) {
//       this.messageHandlers.set(type, []);
//     }
//     this.messageHandlers.get(type)!.push(handler);

//     return () => {
//       const handlers = this.messageHandlers.get(type);
//       if (handlers) {
//         const index = handlers.indexOf(handler);
//         if (index > -1) handlers.splice(index, 1);
//       }
//     };
//   }

//   // ===============================
//   // DISCONNECT
//   // ===============================
//   disconnect() {
//     if (this.reconnectTimeout) {
//       clearTimeout(this.reconnectTimeout);
//     }
//     if (this.ws) {
//       this.ws.close();
//       this.ws = null;
//     }
//   }

//   get isConnected() {
//     return this.ws?.readyState === WebSocket.OPEN;
//   }
// }

// export const wsService = new WebSocketService();

import { useAppStore } from '@/store/useAppStore';

type MessageHandler = (data: unknown) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private url: string = '';

  // ===============================
  // CONNECT
  // ===============================
  // 
  connect(url: string) {
    this.url = url;
    this.createConnection();
  }

  
  

  private createConnection() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[WS] Connected');
        const store = useAppStore.getState();

        store.setConnected(true);
        this.reconnectAttempts = 0;

        store.addLog({
          timestamp: new Date(),
          level: 'info',
          message: 'WebSocket connection established',
          source: 'WebSocket',
        });
      };

      this.ws.onclose = (event) => {
        console.log('[WS] Disconnected:', event.code, event.reason);
        const store = useAppStore.getState();

        store.setConnected(false);
        store.setEngineState('STOPPED'); // ✅ IMPORTANT

        store.addLog({
          timestamp: new Date(),
          level: 'warning',
          message: `WebSocket disconnected: ${event.reason || 'Connection closed'}`,
          source: 'WebSocket',
        });

        this.attemptReconnect();
      };

      this.ws.onerror = () => {
        const store = useAppStore.getState();

        store.addLog({
          timestamp: new Date(),
          level: 'error',
          message: 'WebSocket error occurred',
          source: 'WebSocket',
        });
      };

      // ===============================
      // MESSAGE HANDLER (BACKEND SYNCED)
      // ===============================
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Backend sends RAW payload → normalize
          this.handleMessage({
            type: 'inference',
            payload: data,
          });
        } catch {
          this.handleStreamingMessage(event.data);
        }
      };

    } catch (error) {
      console.error('[WS] Connection error:', error);
      this.attemptReconnect();
    }
  }

  // ===============================
  // MESSAGE ROUTER
  // ===============================
  private handleMessage(data: { type: string; payload: unknown }) {
    const { type, payload } = data;
    const store = useAppStore.getState();

    switch (type) {
      case 'inference': {
        /**
         * Backend payload shape (UPDATED):
         * {
         *   engine_state: "RUNNING" | "STOPPED",
         *   label_id: number,
         *   label_name: string,
         *   confidence: number,
         *   features: object,
         *   proba: number[],
         *   history: { time: number; label: number }[]
         * }
         */
        const p = payload as {
          engine_state: 'RUNNING' | 'STOPPED';
          label_id: number;
          label_name: string;
          confidence: number;
          history: { time: number; label: number }[];
        };

        // ✅ SINGLE SOURCE OF TRUTH
        if (p.engine_state) {
          store.setEngineState(p.engine_state);
        }

        store.addInference({
          timestamp: new Date(),
          model: 'CognitiveSense-RF',
          confidence: p.confidence ?? 0,
          decision: p.label_name,
        });

        store.setConfidence(p.confidence ?? 0);

        store.setSystemState(
          p.label_name === 'Normal' ? 'normal' : 'alert'
        );

        break;
      }

      default: {
        const handlers = this.messageHandlers.get(type);
        if (handlers) {
          handlers.forEach((handler) => handler(payload));
        }
      }
    }
  }

  // ===============================
  // STREAMING TEXT (SAFE)
  // ===============================
  private handleStreamingMessage(text: string) {
    const store = useAppStore.getState();
    if (store.isStreaming) {
      store.appendStreamingText(text);
    }
  }

  // ===============================
  // RECONNECT LOGIC
  // ===============================
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      useAppStore.getState().addLog({
        timestamp: new Date(),
        level: 'error',
        message: 'Max reconnection attempts reached. Please refresh the page.',
        source: 'WebSocket',
      });
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log(`[WS] Reconnecting in ${delay}ms`);

    this.reconnectTimeout = window.setTimeout(() => {
      this.createConnection();
    }, delay);
  }

  // ===============================
  // SEND (OPTIONAL – FUTURE)
  // ===============================
  send(type: string, payload: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  // ===============================
  // SUBSCRIBE (OPTIONAL)
  // ===============================
  subscribe(type: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);

    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) handlers.splice(index, 1);
      }
    };
  }

  // ===============================
  // DISCONNECT
  // ===============================
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    useAppStore.getState().setEngineState('STOPPED');
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();
