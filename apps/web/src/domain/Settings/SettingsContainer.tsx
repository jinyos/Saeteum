'use client';

import { useState } from 'react';
import { Button } from '@/common/components/Button';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { QueryBoundary } from '@/common/components/QueryBoundary';
import { AccountInfo } from './components/AccountInfo';
import { NicknameField } from './components/NicknameField';
import { SettingsSkeleton } from './components/SettingsSkeleton';
import { useDeleteAccount } from './hooks/useDeleteAccount';
import { useLogout } from './hooks/useLogout';
import { useMe } from './hooks/useMe';
import { useUpdateNickname } from './hooks/useUpdateNickname';

function SettingsBody() {
  const { data: me } = useMe();
  const updateNickname = useUpdateNickname();
  const logout = useLogout();
  const deleteAccount = useDeleteAccount();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function handleConfirmDelete() {
    setIsConfirmOpen(false);
    deleteAccount.mutate();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <NicknameField
        nickname={me.nickname}
        onSave={(nickname) => updateNickname.mutate(nickname)}
        isSaving={updateNickname.isPending}
      />

      <AccountInfo provider={me.provider} createdAt={me.createdAt} />

      <div className="mt-auto mb-4 flex justify-center gap-12 pt-4">
        <Button
          variant="highlight"
          highlightWidth="w-18"
          highlightHeight="h-[85%]"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          로그아웃
        </Button>

        <Button
          variant="highlight"
          highlightWidth="w-10"
          highlightHeight="h-[85%]"
          danger
          onClick={() => setIsConfirmOpen(true)}
          disabled={deleteAccount.isPending}
        >
          탈퇴
        </Button>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        message={'탈퇴하면 모든 데이터가 즉시 삭제되고\n되돌릴 수 없어요.'}
        confirmLabel="탈퇴"
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}

export default function SettingsContainer() {
  return (
    <div className="mx-auto flex w-[85%] flex-1 flex-col py-6">
      <QueryBoundary pendingFallback={<SettingsSkeleton />}>
        <SettingsBody />
      </QueryBoundary>
    </div>
  );
}
