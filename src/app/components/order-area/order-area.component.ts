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
      suggestedActions: [
        {
          type: 'reply',
          value: 'Oysters' 
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
      timestamp: new Date(),
      text: 'Welcome to our online order-system! I will be your waiter today. What do you wish to order?'
    }

    this.feed = merge(
      from([introduction]),
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
