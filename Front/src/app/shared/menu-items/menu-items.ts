import {Injectable} from '@angular/core';

export interface BadgeItem {
  type: string;
  value: string;
}

export interface ChildrenItems {
  state: string;
  target?: boolean;
  name: string;
  type?: string;
  children?: ChildrenItems[];
}

export interface MainMenuItems {
  state: string;
  short_label?: string;
  main_state?: string;
  target?: boolean;
  name: string;
  type: string;
  icon: string;
  badge?: BadgeItem[];
  children?: ChildrenItems[];
}

export interface Menu {
  label: string;
  main: MainMenuItems[];
}

const MENUITEMS = [
  {
    label: 'Navigation',
    main: [
      {
        state: 'dashboard',
        short_label: 'D',
        name: 'Dashboard',
        type: 'link',
        icon: 'ti-home'
      },
      {
        state: 'rendezvousnonconfirmes',
        short_label: 'B',
        name: 'Rendez_vous',
        type: 'link',
        icon: 'ti-layout-grid2-alt',
        
      },
      {
        state: 'patients',
        short_label: 'n',
        name: 'Patients',
        type: 'link',
        icon: 'ti-crown'
      },
      {
        state: 'personnels',
        short_label: 'B',
        name: 'Personnels',
        type: 'link',
        icon: 'ti-receipt'
      },
       {
        state: 'bootstrap-table',
        short_label: 'M',
        name: 'Rendez_vous confirmés',
        type: 'link',
        icon: 'ti-map-alt'
      },
    ],
  }
  
];

@Injectable()
export class MenuItems {
  getAll(): Menu[] {
    return MENUITEMS;
  }

  /*add(menu: Menu) {
    MENUITEMS.push(menu);
  }*/
}
