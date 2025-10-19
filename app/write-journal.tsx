import WriteJournalEntry from '@/components/write-journal-entry';
import { useRouter } from 'expo-router';
import React from 'react';

export default function WriteJournalPage() {
  const router = useRouter();

  const handleEntryAdded = () => {
    // The journal page will automatically refresh when we navigate back
    // due to the useFocusEffect hook
  };

  return <WriteJournalEntry onEntryAdded={handleEntryAdded} />;
}