import { useEquippedItems } from '@/hooks/useEquippedItems';
import { usePiggyPoints } from '@/hooks/usePiggyPoints';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Sparkles } from 'lucide-react';
import coinIcon from '@/assets/coin.png';

interface ProfileCardProps {
  compact?: boolean;
}

const ProfileCard = ({ compact = false }: ProfileCardProps) => {
  const { equippedItems, profile, loading } = useEquippedItems();
  const { piggyPoints } = usePiggyPoints();

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </Card>
    );
  }

  const frameConfig = equippedItems.activeFrame?.config as Record<string, any> | null;
  const iconConfig = equippedItems.activeIcon?.config as Record<string, any> | null;
  const backgroundConfig = equippedItems.activeBackground?.config as Record<string, any> | null;

  const displayName = profile?.display_name || profile?.username || 'User';

  // Frame styles
  const frameStyles: React.CSSProperties = frameConfig ? {
    borderColor: frameConfig.borderColor,
    borderWidth: frameConfig.borderWidth,
    borderStyle: frameConfig.borderStyle as any,
    borderImage: frameConfig.borderImage,
    boxShadow: frameConfig.glow
  } : {};

  // Background styles
  const backgroundStyles: React.CSSProperties = backgroundConfig ? {
    background: backgroundConfig.gradient,
    backgroundColor: backgroundConfig.backgroundColor
  } : {};

  if (compact) {
    return (
      <div 
        className="p-3 rounded-xl border border-border relative overflow-hidden"
        style={backgroundStyles}
      >
        {/* Overlay for readability if background is set */}
        {backgroundConfig && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
        )}
        
        <div className="relative flex items-center gap-3">
          {/* Avatar with frame */}
          <div 
            className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl shrink-0"
            style={frameStyles}
          >
            {iconConfig ? (
              <span style={{ color: iconConfig.color }}>{iconConfig.emoji}</span>
            ) : (
              <User className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-sm truncate">{displayName}</div>
            <div className="flex items-center gap-1">
              <img src={coinIcon} alt="Points" className="h-3 w-3" />
              <span className="text-xs text-muted-foreground">
                Lv.{piggyPoints?.current_level || 1}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card 
      className="relative overflow-hidden"
      style={backgroundStyles}
    >
      {/* Overlay for readability if background is set */}
      {backgroundConfig && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      )}
      
      <div className="relative p-6">
        <div className="flex flex-col items-center text-center">
          {/* Avatar with frame */}
          <div 
            className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-3xl mb-3"
            style={frameStyles}
          >
            {iconConfig ? (
              <span style={{ color: iconConfig.color }}>{iconConfig.emoji}</span>
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          
          {/* Name */}
          <h3 className="font-bold text-lg">{displayName}</h3>
          
          {/* Level badge */}
          <Badge variant="secondary" className="mt-2">
            <Sparkles className="h-3 w-3 mr-1" />
            Level {piggyPoints?.current_level || 1}
          </Badge>
          
          {/* Equipped items indicators */}
          <div className="flex gap-2 mt-4 flex-wrap justify-center">
            {equippedItems.activeTheme && (
              <Badge variant="outline" className="text-xs">
                🎨 {equippedItems.activeTheme.name}
              </Badge>
            )}
            {equippedItems.activeFrame && (
              <Badge variant="outline" className="text-xs">
                🖼️ {equippedItems.activeFrame.name}
              </Badge>
            )}
            {equippedItems.activeIcon && (
              <Badge variant="outline" className="text-xs">
                ✨ {equippedItems.activeIcon.name}
              </Badge>
            )}
            {equippedItems.activeBackground && (
              <Badge variant="outline" className="text-xs">
                🌄 {equippedItems.activeBackground.name}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileCard;
