import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const GRID_COLS = 6;
const GRID_ROWS = 7;
const ANIMALS = ['🐼', '🐰', '🦊', '🐷', '🐸', '🐱', '🐥'];

interface Cell {
  id: string;
  animal: string;
  row: number;
  col: number;
}

interface Match3GameProps {
  onBack: () => void;
}

const Match3Game: React.FC<Match3GameProps> = ({onBack}) => {
  const insets = useSafeAreaInsets();
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [score, setScore] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{row: number; col: number} | null>(null);
  const [activeTool, setActiveTool] = useState<'hammer' | 'shuffle' | 'bomb' | null>(null);
  const [animatingCells, setAnimatingCells] = useState<Set<string>>(new Set());

  // 初始化网格
  const initializeGrid = useCallback(() => {
    const newGrid: Cell[][] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      const rowCells: Cell[] = [];
      for (let col = 0; col < GRID_COLS; col++) {
        rowCells.push({
          id: `${row}-${col}`,
          animal: ANIMALS[Math.floor(Math.random() * ANIMALS.length)],
          row,
          col,
        });
      }
      newGrid.push(rowCells);
    }
    setGrid(newGrid);
  }, []);

  // 确保初始网格没有匹配
  const initializeGridWithoutMatches = useCallback(() => {
    let newGrid: Cell[][] = [];
    let hasMatches = true;
    
    while (hasMatches) {
      newGrid = [];
      for (let row = 0; row < GRID_ROWS; row++) {
        const rowCells: Cell[] = [];
        for (let col = 0; col < GRID_COLS; col++) {
          let animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
          
          // 检查左边是否有两个相同的
          if (col >= 2) {
            const left1 = rowCells[col - 1]?.animal;
            const left2 = rowCells[col - 2]?.animal;
            while (animal === left1 && animal === left2) {
              animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
            }
          }
          
          // 检查上边是否有两个相同的
          if (row >= 2) {
            const up1 = newGrid[row - 1]?.[col]?.animal;
            const up2 = newGrid[row - 2]?.[col]?.animal;
            while (animal === up1 && animal === up2) {
              animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
            }
          }
          
          rowCells.push({
            id: `${row}-${col}`,
            animal,
            row,
            col,
          });
        }
        newGrid.push(rowCells);
      }
      
      // 检查是否还有匹配
      hasMatches = findMatches(newGrid).length > 0;
    }
    
    setGrid(newGrid);
    setScore(0);
  }, []);

  useEffect(() => {
    initializeGridWithoutMatches();
  }, [initializeGridWithoutMatches]);

  // 查找所有匹配
  const findMatches = useCallback((currentGrid: Cell[][]): {row: number; col: number}[] => {
    const matches = new Set<string>();
    
    // 检查横向匹配
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS - 2; col++) {
        const animal = currentGrid[row]?.[col]?.animal;
        if (
          animal &&
          currentGrid[row]?.[col + 1]?.animal === animal &&
          currentGrid[row]?.[col + 2]?.animal === animal
        ) {
          matches.add(`${row}-${col}`);
          matches.add(`${row}-${col + 1}`);
          matches.add(`${row}-${col + 2}`);
          
          // 检查更长的匹配
          let extra = 3;
          while (col + extra < GRID_COLS && currentGrid[row]?.[col + extra]?.animal === animal) {
            matches.add(`${row}-${col + extra}`);
            extra++;
          }
        }
      }
    }
    
    // 检查纵向匹配
    for (let col = 0; col < GRID_COLS; col++) {
      for (let row = 0; row < GRID_ROWS - 2; row++) {
        const animal = currentGrid[row]?.[col]?.animal;
        if (
          animal &&
          currentGrid[row + 1]?.[col]?.animal === animal &&
          currentGrid[row + 2]?.[col]?.animal === animal
        ) {
          matches.add(`${row}-${col}`);
          matches.add(`${row + 1}-${col}`);
          matches.add(`${row + 2}-${col}`);
          
          // 检查更长的匹配
          let extra = 3;
          while (row + extra < GRID_ROWS && currentGrid[row + extra]?.[col]?.animal === animal) {
            matches.add(`${row + extra}-${col}`);
            extra++;
          }
        }
      }
    }
    
    return Array.from(matches).map(key => {
      const [row, col] = key.split('-').map(Number);
      return {row, col};
    });
  }, []);

  // 消除匹配并下落
  const processMatches = useCallback(async () => {
    const matches = findMatches(grid);
    if (matches.length === 0) return false;
    
    // 添加动画效果
    const animatingKeys = new Set(matches.map(m => `${m.row}-${m.col}`));
    setAnimatingCells(animatingKeys);
    
    // 等待动画
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 计算分数
    setScore(prev => prev + matches.length * 10);
    
    // 创建新网格
    const newGrid = grid.map(row => row.map(cell => ({...cell})));
    
    // 标记消除的格子
    matches.forEach(({row, col}) => {
      newGrid[row][col] = {...newGrid[row][col], animal: ''};
    });
    
    // 下落填充
    for (let col = 0; col < GRID_COLS; col++) {
      let emptyRow = GRID_ROWS - 1;
      
      // 从下往上找空位
      for (let row = GRID_ROWS - 1; row >= 0; row--) {
        if (newGrid[row][col].animal !== '') {
          if (row !== emptyRow) {
            newGrid[emptyRow][col] = {...newGrid[row][col], row: emptyRow};
            newGrid[row][col] = {...newGrid[row][col], animal: ''};
          }
          emptyRow--;
        }
      }
      
      // 填充新动物
      for (let row = emptyRow; row >= 0; row--) {
        newGrid[row][col] = {
          id: `new-${row}-${col}-${Date.now()}`,
          animal: ANIMALS[Math.floor(Math.random() * ANIMALS.length)],
          row,
          col,
        };
      }
    }
    
    setGrid(newGrid);
    setAnimatingCells(new Set());
    
    return true;
  }, [grid, findMatches]);

  // 连锁消除
  useEffect(() => {
    if (grid.length === 0) return;
    
    const checkAndProcess = async () => {
      const hasMatches = findMatches(grid).length > 0;
      if (hasMatches) {
        await processMatches();
      }
    };
    
    const timer = setTimeout(checkAndProcess, 100);
    return () => clearTimeout(timer);
  }, [grid, findMatches, processMatches]);

  // 交换方块
  const swapCells = useCallback((row1: number, col1: number, row2: number, col2: number) => {
    const newGrid = grid.map(row => row.map(cell => ({...cell})));
    
    // 检查是否相邻
    const isAdjacent = 
      (Math.abs(row1 - row2) === 1 && col1 === col2) ||
      (Math.abs(col1 - col2) === 1 && row1 === row2);
    
    if (!isAdjacent) return;
    
    // 交换
    const temp = newGrid[row1][col1];
    newGrid[row1][col1] = {...newGrid[row2][col2], row: row1, col: col1};
    newGrid[row2][col2] = {...temp, row: row2, col: col2};
    
    // 检查是否有匹配
    const matches = findMatches(newGrid);
    if (matches.length > 0) {
      setGrid(newGrid);
    }
  }, [grid, findMatches]);

  // 锤子道具 - 消除单个
  const useHammer = useCallback((row: number, col: number) => {
    const newGrid = grid.map(r => r.map(cell => ({...cell})));
    newGrid[row][col] = {...newGrid[row][col], animal: ''};
    setScore(prev => prev + 10);
    
    // 下落填充
    for (let c = col; c <= col; c++) {
      let emptyRow = GRID_ROWS - 1;
      for (let r = GRID_ROWS - 1; r >= 0; r--) {
        if (newGrid[r][c].animal !== '') {
          if (r !== emptyRow) {
            newGrid[emptyRow][c] = {...newGrid[r][c], row: emptyRow};
            newGrid[r][c] = {...newGrid[r][c], animal: ''};
          }
          emptyRow--;
        }
      }
      for (let r = emptyRow; r >= 0; r--) {
        newGrid[r][c] = {
          id: `new-${r}-${c}-${Date.now()}`,
          animal: ANIMALS[Math.floor(Math.random() * ANIMALS.length)],
          row: r,
          col: c,
        };
      }
    }
    
    setGrid(newGrid);
    setActiveTool(null);
  }, [grid]);

  // 重排道具 - 打乱所有方块
  const useShuffle = useCallback(() => {
    const animals: string[] = [];
    grid.forEach(row => row.forEach(cell => animals.push(cell.animal)));
    
    // Fisher-Yates 洗牌
    for (let i = animals.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [animals[i], animals[j]] = [animals[j], animals[i]];
    }
    
    const newGrid = grid.map((row, rowIdx) =>
      row.map((cell, colIdx) => ({
        ...cell,
        animal: animals[rowIdx * GRID_COLS + colIdx],
      }))
    );
    
    setGrid(newGrid);
    setActiveTool(null);
  }, [grid]);

  // 炸弹道具 - 消除3x3范围
  const useBomb = useCallback((centerRow: number, centerCol: number) => {
    const newGrid = grid.map(r => r.map(cell => ({...cell})));
    let removedCount = 0;
    
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = centerRow + dr;
        const c = centerCol + dc;
        if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
          if (newGrid[r][c].animal !== '') {
            newGrid[r][c] = {...newGrid[r][c], animal: ''};
            removedCount++;
          }
        }
      }
    }
    
    setScore(prev => prev + removedCount * 10);
    
    // 下落填充所有列
    for (let col = 0; col < GRID_COLS; col++) {
      let emptyRow = GRID_ROWS - 1;
      for (let row = GRID_ROWS - 1; row >= 0; row--) {
        if (newGrid[row][col].animal !== '') {
          if (row !== emptyRow) {
            newGrid[emptyRow][col] = {...newGrid[row][col], row: emptyRow};
            newGrid[row][col] = {...newGrid[row][col], animal: ''};
          }
          emptyRow--;
        }
      }
      for (let row = emptyRow; row >= 0; row--) {
        newGrid[row][col] = {
          id: `new-${row}-${col}-${Date.now()}`,
          animal: ANIMALS[Math.floor(Math.random() * ANIMALS.length)],
          row,
          col,
        };
      }
    }
    
    setGrid(newGrid);
    setActiveTool(null);
  }, [grid]);

  // 处理格子点击
  const handleCellPress = useCallback((row: number, col: number) => {
    if (activeTool === 'hammer') {
      useHammer(row, col);
    } else if (activeTool === 'bomb') {
      useBomb(row, col);
    } else if (selectedCell) {
      swapCells(selectedCell.row, selectedCell.col, row, col);
      setSelectedCell(null);
    } else {
      setSelectedCell({row, col});
    }
  }, [activeTool, selectedCell, useHammer, useBomb, swapCells]);

  // 拖拽处理
  const createPanResponder = useCallback((row: number, col: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !activeTool,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const {dx, dy} = gestureState;
        return Math.abs(dx) > 10 || Math.abs(dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        const {dx, dy} = gestureState;
        const threshold = 30;
        
        let targetRow = row;
        let targetCol = col;
        
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
          targetCol = dx > 0 ? col + 1 : col - 1;
        } else if (Math.abs(dy) > threshold) {
          targetRow = dy > 0 ? row + 1 : row - 1;
        }
        
        if (
          targetRow >= 0 && targetRow < GRID_ROWS &&
          targetCol >= 0 && targetCol < GRID_COLS &&
          (targetRow !== row || targetCol !== col)
        ) {
          swapCells(row, col, targetRow, targetCol);
        }
      },
    });
  }, [activeTool, swapCells]);

  const screenWidth = Dimensions.get('window').width;
  const cellSize = (screenWidth - 48) / GRID_COLS;

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* 分数和步数 */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>分数</Text>
          <Text style={[styles.statValue, {color: '#8ecae6'}]}>{score.toLocaleString()}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>步数</Text>
          <Text style={[styles.statValue, {color: '#ff8fab'}]}>∞</Text>
        </View>
      </View>

      {/* 游戏网格 */}
      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {grid.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
              const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
              const isAnimating = animatingCells.has(`${rowIdx}-${colIdx}`);
              
              return (
                <TouchableOpacity
                  key={cell.id}
                  style={[
                    styles.cell,
                    {
                      width: cellSize,
                      height: cellSize,
                    },
                    isSelected && styles.selectedCell,
                    isAnimating && styles.animatingCell,
                    activeTool === 'hammer' && styles.hammerCursor,
                    activeTool === 'bomb' && styles.bombCursor,
                  ]}
                  onPress={() => handleCellPress(rowIdx, colIdx)}
                  {...createPanResponder(rowIdx, colIdx).panHandlers}>
                  <Text style={styles.animalText}>{cell.animal}</Text>
                </TouchableOpacity>
              );
            }),
          )}
        </View>
      </View>

      {/* 道具栏 */}
      <View style={[styles.toolsContainer, {paddingBottom: insets.bottom + 20}]}>
        <TouchableOpacity
          style={[styles.toolButton, activeTool === 'hammer' && styles.activeTool]}
          onPress={() => setActiveTool(activeTool === 'hammer' ? null : 'hammer')}>
          <View style={[styles.toolIcon, {backgroundColor: '#ff8fab'}]}>
            <Text style={styles.toolEmoji}>🔨</Text>
          </View>
          <Text style={styles.toolLabel}>锤子</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButtonLarge, activeTool === 'shuffle' && styles.activeToolLarge]}
          onPress={useShuffle}>
          <View style={[styles.toolIconLarge, {backgroundColor: '#f4d125'}]}>
            <Text style={styles.toolEmojiLarge}>🔀</Text>
          </View>
          <Text style={styles.toolLabelLarge}>重排</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, activeTool === 'bomb' && styles.activeTool]}
          onPress={() => setActiveTool(activeTool === 'bomb' ? null : 'bomb')}>
          <View style={[styles.toolIcon, {backgroundColor: '#8ecae6'}]}>
            <Text style={styles.toolEmoji}>💣</Text>
          </View>
          <Text style={styles.toolLabel}>炸弹</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#221f10',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#fff',
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 24,
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  gridContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 24,
    padding: 12,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cell: {
    backgroundColor: '#322e1b',
    borderRadius: 12,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0, 0, 0, 0.3)',
  },
  selectedCell: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{scale: 1.1}],
  },
  animatingCell: {
    opacity: 0.3,
    transform: [{scale: 0.8}],
  },
  hammerCursor: {
    borderWidth: 2,
    borderColor: '#ff8fab',
  },
  bombCursor: {
    borderWidth: 2,
    borderColor: '#8ecae6',
  },
  animalText: {
    fontSize: 28,
  },
  toolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  toolButton: {
    alignItems: 'center',
  },
  toolButtonLarge: {
    alignItems: 'center',
  },
  activeTool: {
    opacity: 0.7,
  },
  activeToolLarge: {
    opacity: 0.7,
  },
  toolIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  toolIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  toolEmoji: {
    fontSize: 28,
  },
  toolEmojiLarge: {
    fontSize: 36,
  },
  toolLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  toolLabelLarge: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default Match3Game;
