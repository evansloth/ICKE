import WriteJournalEntry from '@/components/write-journal-entry';
import { useLocalSearchParams } from 'expo-router';

export default function WriteJournalPage() {
  const params = useLocalSearchParams();
  const suggestionType = params.suggestionType as string | undefined;
  const suggestionTitle = params.suggestionTitle as string | undefined;
  
  return <WriteJournalEntry suggestionType={suggestionType} suggestionTitle={suggestionTitle} />;
}