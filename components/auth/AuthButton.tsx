'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Github, GitlabIcon as Gitlab, LogOut, User, Settings } from 'lucide-react'
import Link from 'next/link'

export function AuthButton() {
  const { user, userProfile, loading, signInWithGitHub, signInWithGitLab, signOut } = useAuth()

  if (loading) {
    return (
      <Button variant="ghost" disabled>
        読み込み中...
      </Button>
    )
  }

  if (user && userProfile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userProfile.avatar_url || ''} alt={userProfile.display_name || userProfile.username} />
              <AvatarFallback>
                {(userProfile.display_name || userProfile.username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {userProfile.display_name || userProfile.username}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {userProfile.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <User className="mr-2 h-4 w-4" />
              <span>ダッシュボード</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>設定</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>ログアウト</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex space-x-2">
      <Button onClick={signInWithGitHub} variant="outline" size="sm">
        <Github className="mr-2 h-4 w-4" />
        GitHub
      </Button>
      <Button onClick={signInWithGitLab} variant="outline" size="sm">
        <Gitlab className="mr-2 h-4 w-4" />
        GitLab
      </Button>
    </div>
  )
}