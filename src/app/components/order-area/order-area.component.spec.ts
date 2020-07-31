import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderAreaComponent } from './order-area.component';

describe('OrderAreaComponent', () => {
  let component: OrderAreaComponent;
  let fixture: ComponentFixture<OrderAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
