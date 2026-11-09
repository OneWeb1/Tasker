   import type { RoutePath } from '@/shared/config/routePaths';
   import { useNavDrawerHost } from '../../model/hooks/useNavDrawerHost';
import { useRouteBackSwipe } from '../../model/hooks/useRouteBackSwipe';
import { NavDrawer } from '../NavDrawer';

interface NavDrawerHostProps {
  route: RoutePath;
}

export function NavDrawerHost({ route }: NavDrawerHostProps) {
   const nav = useNavDrawerHost(route);
   useRouteBackSwipe(route);

   return (
     <NavDrawer
       isOpen={nav.isOpen}
       isCovered={nav.isCovered}
       onClose={nav.close}
       onOpenProfile={nav.openProfile}
       onOpenSettings={nav.openSettings}
     />
   );
}