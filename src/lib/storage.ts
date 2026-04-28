import { Conversation, FuncType, Asset } from '../types';
import localforage from 'localforage';

localforage.config({
  name: 'fx_assets_db',
  storeName: 'assets'
});

export async function saveState(
  conversations: Record<string, Conversation>,
  currentFunc: FuncType,
  currentConvId: string | null,
  currentModelId: string,
  currentModelName: string,
  apiKey: string
) {
  try {
    // Deep clone and strip non-serializable data (functions, etc.)
    const cleanConversations = JSON.parse(JSON.stringify(conversations, (key, value) => {
      if (typeof value === 'function') return undefined;
      return value;
    }));

    await localforage.setItem('fx_convs_db', cleanConversations);
    localStorage.setItem('fx_func', currentFunc);
    localStorage.setItem('fx_conv', currentConvId || '');
    localStorage.setItem('fx_model_id', currentModelId);
    localStorage.setItem('fx_model_name', currentModelName);
    localStorage.setItem('fx_api_key', apiKey);
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

export async function loadState() {
  try {
    const conversations = await localforage.getItem<Record<string, Conversation>>('fx_convs_db') || {};
    
    // Migration from localStorage if needed
    if (Object.keys(conversations).length === 0) {
      const c = localStorage.getItem('fx_convs');
      if (c) {
        const legacyConvs = JSON.parse(c);
        await localforage.setItem('fx_convs_db', legacyConvs);
        // localStorage.removeItem('fx_convs'); // Optional: cleanup
        return {
          conversations: legacyConvs,
          currentFunc: (localStorage.getItem('fx_func') as FuncType) || 'chat',
          currentModelId: localStorage.getItem('fx_model_id') || 'gemini-3.1-pro',
          currentModelName: localStorage.getItem('fx_model_name') || 'Gemini 3.1 Pro',
          currentConvId: (localStorage.getItem('fx_conv') || null),
          apiKey: localStorage.getItem('fx_api_key') || '',
        };
      }
    }

    const func = (localStorage.getItem('fx_func') as FuncType) || 'chat';
    const modelId = localStorage.getItem('fx_model_id') || 'gemini-3.1-pro';
    const modelName = localStorage.getItem('fx_model_name') || 'Gemini 3.1 Pro';
    const convId = localStorage.getItem('fx_conv') || null;
    const apiKey = localStorage.getItem('fx_api_key') || '';

    return {
      conversations,
      currentFunc: func,
      currentModelId: modelId,
      currentModelName: modelName,
      currentConvId: convId && conversations[convId] ? convId : null,
      apiKey,
    };
  } catch (e) {
    return {
      conversations: {} as Record<string, Conversation>,
      currentFunc: 'chat' as FuncType,
      currentModelId: 'gemini-3.1-pro',
      currentModelName: 'Gemini 3.1 Pro',
      currentConvId: null,
      apiKey: '',
    };
  }
}

export async function saveAssets(assets: Asset[]) {
  try {
    await localforage.setItem('assets_list', assets);
  } catch (e) {
    console.error('Failed to save assets', e);
  }
}

export async function loadAssets(): Promise<Asset[]> {
  try {
    const assets = await localforage.getItem<Asset[]>('assets_list');
    return assets || [];
  } catch (e) {
    console.error('Failed to load assets', e);
    return [];
  }
}
