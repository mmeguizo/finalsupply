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
    selectionsByContext: {},
    IARSelections: {},
      issuanceParSelections: {
        recieved_from: "",
        recieved_by: "",
        metadata: {
          recieved_from: { position: "", role: "" },
          recieved_by: { position: "", role: "" }
        }
      },
      
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
      
      selectSignatory: (id: string) => {
        const signatory = get().signatories.find(s => s.id === id) || null;
        set({ selectedSignatory: signatory });
      },
      setIssuanceParSelections: (selections) => {
        set({ issuanceParSelections: selections });
      },

      setIARSelections: (selections) => {

        console.log("Setting IARSelections in store:", selections);

        set({ IARSelections: selections });
      },
      getSelections: (key: string) => {
        return get().selectionsByContext[key];
      },
      setSelections: (key: string, selections: any) => {
        const current = get().selectionsByContext || {};
        set({ selectionsByContext: { ...current, [key]: selections } });
      },
      // Add or update a signatory in the persisted signatory list
      addOrUpdateSignatory: (signatory: Signatory) => {
        try {
          const current = get().signatories || [];
          const matchIndex = current.findIndex((s: Signatory) =>
            (signatory.id && s.id === signatory.id) ||
            (s.name === signatory.name && s.role === signatory.role)
          );
          if (matchIndex !== -1) {
            const next = [...current];
            next[matchIndex] = { ...next[matchIndex], ...signatory };
            set({ signatories: next });
          } else {
            set({ signatories: [...current, signatory] });
          }
        } catch (e) {
          // swallow for now
          console.error('Failed to addOrUpdateSignatory', e);
        }
      },
      
      clearSelectedSignatory: () => set({ selectedSignatory: null }),
      clearIARSelections: () => set({ IARSelections: {} }),
      clearIssuanceParSelections: () => set({
        issuanceParSelections: {
          recieved_from: "",
          recieved_by: "",
          metadata: {
            recieved_from: { position: "", role: "" },
            recieved_by: { position: "", role: "" }
          }
        }
      }),
      clearSelections: (key: string) => {
        const next = { ...(get().selectionsByContext || {}) };
        delete next[key];
        set({ selectionsByContext: next });
      }
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
