import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { client } from '../apollo/client';
import { GET_SIGNATORIES } from '../graphql/queries/signatory.query';
import { Signatory, SignatoryStore } from '../types/signatory/signatoryTypes';

const useSignatoryStore = create<SignatoryStore>()(
  persist(
    (set, get) => ({
      signatories: [],
      selectedSignatory: null,
      loading: false,
      error: null,
      
      fetchSignatories: async () => {
        set({ loading: true });
        try {
          const { data } = await client.query({
            query: GET_SIGNATORIES,
            fetchPolicy: 'network-only'
          });
          set({ signatories: data.signatories, loading: false });
        } catch (err: any) {
          set({ error: err.message, loading: false });
        }
      },
      
      getSignatoryByRole: (role: string) => {
        return get().signatories.find(sig => sig.role.toLowerCase() === role.toLowerCase());
      },
      
      selectSignatory: (id) => {
        const signatory = get().signatories.find(s => s.id === id) || null;
        set({ selectedSignatory: signatory });
      },
      
      clearSelectedSignatory: () => set({ selectedSignatory: null })
    }),
    {
      name: 'signatory-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);

export default useSignatoryStore;


// import { create } from 'zustand';
// import { client } from '../apollo/client';
// import { GET_SIGNATORIES } from '../graphql/queries/signatory.query';
// import {  SignatoryStore} from '../types/signatory/signatoryTypes';



// const useSignatoryStore = create<SignatoryStore>((set, get) => ({
//   signatories: [],
//   selectedSignatory: null,
//   loading: false,
//   error: null,
  
//   fetchSignatories: async () => {
//     set({ loading: true });
//     try {
//       const { data } = await client.query({
//         query: GET_SIGNATORIES,
//         fetchPolicy: 'network-only'
//       });
//       set({ signatories: data.signatories, loading: false });
//     } catch (err: any) {
//       set({ error: err.message, loading: false });
//     }
//   },

//   getSignatoryByRole: (role : string) => {
//     return get().signatories.find(sig => sig.role.toLowerCase() === role.toLowerCase());
//   },
  
//   selectSignatory: (id) => {
//     const signatory = get().signatories.find(s => s.id === id) || null;
//     set({ selectedSignatory: signatory });
//   },
  
//   clearSelectedSignatory: () => set({ selectedSignatory: null })
// }));

// export default useSignatoryStore;
