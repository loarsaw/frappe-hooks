import { useFrappeContext } from '../context/FrappeContext';
import { getUtils } from '../utils';

export function useFrappeClient() {
  const { client } = useFrappeContext();

  return {
    client,
    ...getUtils(client),
  };
}
