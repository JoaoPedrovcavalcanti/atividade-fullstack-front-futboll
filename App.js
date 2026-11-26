import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { API_URL } from './src/config';

const POSICOES = ['Goleiro', 'Zagueiro', 'Lateral', 'Meio-campo', 'Atacante'];

const FORM_VAZIO = { nome: '', clube: '', posicao: 'Atacante', numero: '10', gols: '0' };

export default function App() {
  const [jogadores, setJogadores] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [apiOffline, setApiOffline] = useState(false);
  const [busca, setBusca] = useState('');

  const [modalForm, setModalForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erroForm, setErroForm] = useState('');

  const [jogadorParaExcluir, setJogadorParaExcluir] = useState(null);

  // ---------------- READ: listar jogadores ----------------
  async function carregarJogadores() {
    try {
      setCarregando(true);
      const resposta = await fetch(`${API_URL}/jogadores`);
      if (!resposta.ok) throw new Error('Falha na API');
      const dados = await resposta.json();
      setJogadores(dados);
      setApiOffline(false);
    } catch (erro) {
      setApiOffline(true);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useEffect(() => {
    carregarJogadores();
  }, []);

  function onRefresh() {
    setAtualizando(true);
    carregarJogadores();
  }

  // ---------------- CREATE / UPDATE: salvar ----------------
  function abrirCadastro() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setErroForm('');
    setModalForm(true);
  }

  function abrirEdicao(jogador) {
    setEditandoId(jogador._id);
    setForm({
      nome: jogador.nome,
      clube: jogador.clube,
      posicao: jogador.posicao,
      numero: String(jogador.numero),
      gols: String(jogador.gols),
    });
    setErroForm('');
    setModalForm(true);
  }

  async function salvarJogador() {
    if (!form.nome.trim()) {
      setErroForm('Informe o nome do jogador.');
      return;
    }
    if (!form.clube.trim()) {
      setErroForm('Informe o clube.');
      return;
    }

    const dados = {
      nome: form.nome.trim(),
      clube: form.clube.trim(),
      posicao: form.posicao,
      numero: Number(form.numero) || 10,
      gols: Number(form.gols) || 0,
    };

    try {
      const url = editandoId ? `${API_URL}/jogadores/${editandoId}` : `${API_URL}/jogadores`;
      const resposta = await fetch(url, {
        method: editandoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      if (!resposta.ok) {
        const erro = await resposta.json();
        throw new Error(erro.erro || 'Erro ao salvar.');
      }
      setModalForm(false);
      carregarJogadores();
    } catch (erro) {
      setErroForm(erro.message || 'Erro ao salvar. Verifique se a API está rodando.');
    }
  }

  // ---------------- DELETE: excluir ----------------
  async function confirmarExclusao() {
    const alvo = jogadorParaExcluir;
    setJogadorParaExcluir(null);
    if (!alvo) return;
    try {
      const resposta = await fetch(`${API_URL}/jogadores/${alvo._id}`, { method: 'DELETE' });
      if (!resposta.ok) throw new Error('Falha ao excluir');
    } catch (erro) {
      setApiOffline(true);
    }
    carregarJogadores();
  }

  // Busca por nome ou clube (feita na tela)
  const listaFiltrada = jogadores.filter((j) => {
    const texto = busca.trim().toLowerCase();
    if (!texto) return true;
    return j.nome.toLowerCase().includes(texto) || j.clube.toLowerCase().includes(texto);
  });

  function renderJogador({ item }) {
    return (
      <View style={styles.card}>
        <View style={styles.numeroBox}>
          <Text style={styles.numeroTexto}>{item.numero}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.info}>
            {item.clube} • {item.posicao}
          </Text>
          <Text style={styles.gols}>⚽ {item.gols} gols</Text>
          <View style={styles.botoesRow}>
            <TouchableOpacity style={styles.botaoEditar} onPress={() => abrirEdicao(item)}>
              <Text style={styles.botaoTexto}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botaoExcluir} onPress={() => setJogadorParaExcluir(item)}>
              <Text style={styles.botaoTexto}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.titulo}>⚽ Meus Jogadores</Text>
        <Text style={styles.subtitulo}>{jogadores.length} cadastrados</Text>
      </View>

      {apiOffline && (
        <View style={styles.bannerErro}>
          <Text style={styles.bannerErroTexto}>
            Não foi possível falar com a API em {API_URL}. Inicie o backend e confira o IP em src/config.js.
          </Text>
          <TouchableOpacity onPress={carregarJogadores}>
            <Text style={styles.bannerErroBotao}>Tentar de novo</Text>
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        style={styles.busca}
        placeholder="Buscar por nome ou clube..."
        placeholderTextColor="#6b7280"
        value={busca}
        onChangeText={setBusca}
      />

      <TouchableOpacity style={styles.botaoAdicionar} onPress={abrirCadastro}>
        <Text style={styles.botaoAdicionarTexto}>+ Adicionar jogador</Text>
      </TouchableOpacity>

      {carregando && !atualizando ? (
        <ActivityIndicator size="large" color="#22c55e" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={listaFiltrada}
          keyExtractor={(item) => item._id}
          renderItem={renderJogador}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={atualizando} onRefresh={onRefresh} tintColor="#22c55e" />}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum jogador encontrado.</Text>}
        />
      )}

      {/* Modal de cadastro / edição */}
      <Modal visible={modalForm} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalFundo}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCaixa}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitulo}>{editandoId ? 'Editar jogador' : 'Novo jogador'}</Text>

              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                value={form.nome}
                onChangeText={(t) => setForm({ ...form, nome: t })}
                placeholder="Ex: Neymar Jr"
                placeholderTextColor="#6b7280"
              />

              <Text style={styles.label}>Clube</Text>
              <TextInput
                style={styles.input}
                value={form.clube}
                onChangeText={(t) => setForm({ ...form, clube: t })}
                placeholder="Ex: Santos"
                placeholderTextColor="#6b7280"
              />

              <Text style={styles.label}>Posição</Text>
              <View style={styles.posicoesRow}>
                {POSICOES.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.chip, form.posicao === p && styles.chipAtivo]}
                    onPress={() => setForm({ ...form, posicao: p })}
                  >
                    <Text style={[styles.chipTexto, form.posicao === p && { color: '#052e16' }]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Camisa (1-99)</Text>
                  <TextInput
                    style={styles.input}
                    value={form.numero}
                    onChangeText={(t) => setForm({ ...form, numero: t })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Gols</Text>
                  <TextInput
                    style={styles.input}
                    value={form.gols}
                    onChangeText={(t) => setForm({ ...form, gols: t })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {erroForm !== '' && <Text style={styles.erroForm}>{erroForm}</Text>}

              <View style={styles.botoesRow}>
                <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalForm(false)}>
                  <Text style={styles.botaoTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botaoSalvar} onPress={salvarJogador}>
                  <Text style={[styles.botaoTexto, { color: '#052e16' }]}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal visible={jogadorParaExcluir !== null} animationType="fade" transparent>
        <View style={[styles.modalFundo, { justifyContent: 'center', padding: 24 }]}>
          <View style={styles.modalCaixa}>
            <Text style={styles.modalTitulo}>Excluir jogador?</Text>
            <Text style={styles.info}>
              {jogadorParaExcluir ? `${jogadorParaExcluir.nome} será removido do banco de dados.` : ''}
            </Text>
            <View style={[styles.botoesRow, { marginTop: 20 }]}>
              <TouchableOpacity style={styles.botaoCancelar} onPress={() => setJogadorParaExcluir(null)}>
                <Text style={styles.botaoTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botaoExcluir} onPress={confirmarExclusao}>
                <Text style={styles.botaoTexto}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1410', paddingTop: Platform.OS === 'android' ? 30 : 0 },
  header: { padding: 16, paddingBottom: 8 },
  titulo: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  subtitulo: { color: '#9ca3af', marginTop: 2 },

  bannerErro: { backgroundColor: '#7f1d1d', marginHorizontal: 16, padding: 12, borderRadius: 10, marginBottom: 8 },
  bannerErroTexto: { color: '#fff', fontSize: 12 },
  bannerErroBotao: { color: '#fecaca', fontWeight: 'bold', marginTop: 6 },

  busca: {
    backgroundColor: '#14231b',
    color: '#fff',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 10,
  },
  botaoAdicionar: {
    backgroundColor: '#22c55e',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  botaoAdicionarTexto: { color: '#052e16', fontWeight: 'bold', fontSize: 16 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#14231b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 14,
  },
  numeroBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroTexto: { color: '#052e16', fontWeight: 'bold', fontSize: 20 },
  nome: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  info: { color: '#9ca3af', marginTop: 2 },
  gols: { color: '#86efac', marginTop: 4 },
  vazio: { color: '#9ca3af', textAlign: 'center', marginTop: 40 },

  botoesRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  botaoEditar: { backgroundColor: '#2563eb', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  botaoExcluir: { backgroundColor: '#dc2626', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  botaoCancelar: { backgroundColor: '#374151', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  botaoSalvar: { backgroundColor: '#22c55e', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },

  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCaixa: { backgroundColor: '#0f1d16', padding: 20, borderRadius: 16, maxHeight: '90%' },
  modalTitulo: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  label: { color: '#9ca3af', marginTop: 12, marginBottom: 4 },
  input: { backgroundColor: '#14231b', color: '#fff', padding: 12, borderRadius: 8 },
  posicoesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#14231b', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  chipAtivo: { backgroundColor: '#22c55e' },
  chipTexto: { color: '#fff' },
  erroForm: { color: '#f87171', marginTop: 12 },
});
