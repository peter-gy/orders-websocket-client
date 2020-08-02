import { Component, OnInit } from '@angular/core';
import { ChatModule, Message, User, Action, ExecuteActionEvent, SendMessageEvent } from '@progress/kendo-angular-conversational-ui';
import { Subject, from, merge, Observable } from 'rxjs';
import { switchMap, map, windowCount, scan, take, tap } from 'rxjs/operators';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-order-area',
  templateUrl: './order-area.component.html',
  styleUrls: ['./order-area.component.scss']
})
export class OrderAreaComponent {

  public feed: Observable<Message[]>
  public readonly waiter: User = {
    id: 'waiter',
    name: 'Jean the Waiter',
    avatarUrl: 'https://avatars.dicebear.com/api/male/best-waiter.svg?mood[]=happy'
  };
  public readonly cook: User = {
    id: 'cook',
    name: 'Gordon the Ramsey',
    avatarUrl: 'https://avatars.dicebear.com/api/male/best-cook.svg?mood[]=happy'
  };
  public readonly customer: User = {
    id: 'customer',
    name: 'You the Customer',
    avatarUrl: 'https://avatars.dicebear.com/api/male/best-customer.svg?mood[]=happy'
  };

  private localMessages: Subject<Message> = new Subject<Message>();

  constructor(private websocketService: WebsocketService) {
    const introduction: Message = {
      author: this.waiter,
      timestamp: new Date(),
      text: 'Welcome to our online order-system! I will be your waiter today.'
    }

    const headsUp0: Message = {
      author: this.waiter,
      timestamp: new Date(),
      text: 'Just a quick heads-up: I am extremely dedicated to my job. That means that no matter what you type to me, I will send it to our cook immediately as an order to prepare it.'
    }

    const headsUp1: Message = {
      author: this.waiter,
      timestamp: new Date(),
      text: "Don't say I didn't warn you..."
    }

    const orderPrompt: Message = {
      author: this.waiter,
      timestamp: new Date(),
      suggestedActions: [
        {
          type: 'reply',
          value: 'Körömpörkölt' 
        },
        {
          type: 'reply',
          value: 'Chia Seed Pudding' 
        },
        {
          type: 'reply',
          value: 'Pacal' 
        },
        {
          type: 'reply',
          value: 'Csülök' 
        }
      ],
      text: 'So... what would you like to eat today? Here are a few healthy options to try:'
    }

    this.feed = merge(
      from([introduction, headsUp0, headsUp1, orderPrompt]),
      this.localMessages,
      this.websocketService.registeredOrderResponses.pipe(
        map((response): Message => ({
          author: this.waiter,
          text: response
        }))
      ),
      this.websocketService.preparedOrderResponses.pipe(
        map((response): Message => ({
          author: this.cook,
          text: response
        }))
      ),
      this.websocketService.completedOrderResponses.pipe(
        map((response): Message => ({
          author: this.waiter,
          text: response
        }))
      )
    ).pipe(
      scan((acc: Message[], x: Message) => [...acc, x], [])
    )
  }

  public sendMessage(e: SendMessageEvent): void {
    this.localMessages.next(e.message);

    this.localMessages.next({
      author: this.waiter,
      typing: true
    });

    this.websocketService.stompClient.send('/app/order-new', {}, e.message.text);
  }

}
