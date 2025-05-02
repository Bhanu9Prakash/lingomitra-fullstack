import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useSimpleToast } from "@/hooks/use-simple-toast";
import { useLocation, Link } from "wouter";
import { User, LogOut, Settings, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function UserMenu() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useSimpleToast();
  const [_, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
        variant: "default",
      });
      navigate("/auth");
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  // If no user, show login button
  if (!user) {
    return (
      <Button variant="outline" asChild>
        <Link href="/auth">
          <User className="h-4 w-4 mr-2" />
          Login
        </Link>
      </Button>
    );
  }

  // Get initials for avatar
  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-8 w-8 rounded-full hover:bg-primary/10 focus:bg-primary/10 focus:ring-2 focus:ring-primary active:scale-95"
        >
          <Avatar className="h-8 w-8 transition-transform duration-200 hover:scale-110">
            <AvatarFallback className="bg-primary text-white font-semibold text-xs">{getInitials(user.username)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 border-primary/20 bg-background shadow-lg rounded-md overflow-hidden" 
        align="end" 
        forceMount 
        style={{ position: 'fixed', zIndex: 9999 }}
      >
        <DropdownMenuLabel className="font-normal bg-primary/5 rounded-t-md border-b border-border/30">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              Logged in
            </p>
          </div>
        </DropdownMenuLabel>
        <div className="p-1">
          <DropdownMenuItem className="cursor-pointer rounded-md my-0.5 focus:bg-accent/80" asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="cursor-pointer flex justify-between items-center rounded-md my-0.5 focus:bg-accent/80" 
            onClick={(e) => e.preventDefault()}
          >
            <div className="flex items-center">
              {/* Show the icon for what will happen when clicked, not the current state */}
              {theme === 'dark' 
                ? <Sun className="mr-2 h-4 w-4 text-yellow-500" /> 
                : <Moon className="mr-2 h-4 w-4 text-blue-300" />
              }
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              aria-label="Toggle dark mode"
            />
          </DropdownMenuItem>
        </div>
        
        <DropdownMenuSeparator className="my-1" />
        
        <div className="p-1">
          <DropdownMenuItem 
            className="cursor-pointer text-red-500 focus:bg-red-500/10 hover:bg-red-500/10 rounded-md" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}