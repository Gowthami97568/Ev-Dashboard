import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { EvUsersComponent } from './ev-users.component';
import { AuthService } from '../services/auth.service';
import { PermissionsService } from '../services/permissions.service';

describe('EvUsersComponent', () => {
  let fixture: ComponentFixture<EvUsersComponent>;
  let component: EvUsersComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvUsersComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            logout: jasmine.createSpy('logout'),
            getUsername: () => 'admin'
          }
        },
        { provide: PermissionsService, useValue: { hasAccess: () => true } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EvUsersComponent);
    component = fixture.componentInstance;
    spyOn(component, 'loadUsers');
    fixture.detectChanges();
  });

  it('shows only main user columns and excludes database metadata', () => {
    component.filteredUsers = [{
      id: 12,
      consumerid: 'consumer-12',
      mobile: '5550100',
      fname: 'Sam',
      createddate: '2026-01-01',
      modifieddate: '2026-01-02',
      internal_notes: 'not a table column'
    }];

    expect(component.getUserColumns()).toEqual([
      'mobile',
      'fname'
    ]);
  });

  it('opens read-only details with every returned field', () => {
    const user = {
      id: 12,
      consumerid: 'consumer-12',
      createddate: '2026-01-01',
      preferences: { notifications: true }
    };

    component.viewUser(user);

    expect(component.isViewModalOpen).toBeTrue();
    expect(component.getViewableKeys()).toEqual(Object.keys(user));
    expect(component.formatRecordValue(user.preferences)).toBe('{"notifications":true}');

    component.closeViewModal();

    expect(component.isViewModalOpen).toBeFalse();
    expect(component.viewingUser).toBeNull();
  });

  it('renders the View modal independently of the Edit modal', () => {
    component.filteredUsers = [{
      id: 12,
      fname: 'Sam',
      createddate: '2026-01-01'
    }];
    fixture.detectChanges();

    const viewButton = fixture.nativeElement.querySelector('.view-btn') as HTMLButtonElement;
    viewButton.click();
    fixture.detectChanges();

    const detailsDialog = fixture.nativeElement.querySelector(
      '[aria-labelledby="user-details-title"]'
    ) as HTMLElement;

    expect(detailsDialog).not.toBeNull();
    expect(detailsDialog.textContent).toContain('2026-01-01');
    expect(fixture.nativeElement.textContent).not.toContain('Save Changes');
  });

  it('excludes primary key fields from editable keys', () => {
    component.filteredUsers = [{
      id: 12,
      fname: 'Sam',
      mobile: '5550100'
    }];
    component.editingUser = { ...component.filteredUsers[0] };

    expect(component.isUserKeyColumn('id')).toBeTrue();
    expect(component.getEditableKeys()).toEqual(['mobile', 'fname']);
  });
});
