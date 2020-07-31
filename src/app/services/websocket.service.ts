import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  public readonly stompClient: Stomp.Client;
  public readonly registeredOrderResponses: Subject<string> = new Subject<string>(); // responds: waiter
  public readonly preparedOrderResponses: Subject<string> = new Subject<string>(); // responds: cook
  public readonly completedOrderResponses: Subject<string> = new Subject<string>(); // responds: waiter

  constructor() {
    const socket = new SockJS('http://localhost:8080/orders-ws');
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect({}, (frame) => this.subscribeToEndpoints());
  }

  subscribeToEndpoints(): void {
    this.stompClient.subscribe('/topic/registered-orders', (order) => this.registeredOrderResponses.next(order.body));
    this.stompClient.subscribe('/topic/prepared-orders', (order) => this.preparedOrderResponses.next(order.body));
    this.stompClient.subscribe('/topic/completed-orders', (order) => this.completedOrderResponses.next(order.body));
  }

}
