import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Vibration,
  BackHandler,
  Animated,
  PanResponder,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const GRID_COLS = 6;
const GRID_ROWS = 8;
const CELL_GAP = 6;
const GRID_BORDER = 12;
const ANIMALS = ['🐼', '🐰', '🦊', '🐷', '🐸', '🐱', '🐥'];

interface Cell {
  id: string;
  animal: string;
}

interface Match3GameProps {
  onBack: () => void;
}

const Match3Game: React.FC<Match3GameProps> = ({onBack}) => {
  const insets = useSafeAreaInsets();
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [score, setScore] = useState(0);
  const [activeTool, setActiveTool] = useState<'hammer' | 'shuffle' | 'bomb' | null>(null);
  const [selectedCell, setSelectedCell] = useState<{row: number; col: number} | null>(null);
  const [animatingCells, setAnimatingCells] = useState<Set<string>>(new Set());
  const [swappingCells, setSwappingCells] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 计算格子尺寸
  const screenWidth = Dimensions.get('window').width;
  const gridWidth = screenWidth - 32;
  const cellSize = (gridWidth - GRID_BORDER * 2 - CELL_GAP * (GRID_COLS - 1)) / GRID_COLS;
  const gridHeight = GRID_BORDER * 2 + cellSize * GRID_ROWS + CELL_GAP * (GRID_ROWS - 1);

  // 手势状态
  const gestureRef = useRef<{
    startX: number;
    startY: number;
    row: number;
    col: number;
    moved: boolean;
  } | null>(null);

  // 查找所有匹配
  const findMatches = useCallback((currentGrid: Cell[][]): {row: number; col: number}[] => {
    const matches = new Set<string>();
    
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS - 2; col++) {
        const animal = currentGrid[row]?.[col]?.animal;
        if (animal && currentGrid[row]?.[col + 1]?.animal === animal && currentGrid[row]?.[col + 2]?.animal === animal) {
          matches.add(`${row}-${col}`);
          matches.add(`${row}-${col + 1}`);
          matches.add(`${row}-${col + 2}`);
          let extra = 3;
          while (col + extra < GRID_COLS && currentGrid[row]?.[col + extra]?.animal === animal) {
            matches.add(`${row}-${col + extra}`);
            extra++;
          }
        }
      }
    }
    
    for (let col = 0; col < GRID_COLS; col++) {
      for (let row = 0; row < GRID_ROWS - 2; row++) {
        const animal = currentGrid[row]?.[col]?.animal;
        if (animal && currentGrid[row + 1]?.[col]?.animal === animal && currentGrid[row + 2]?.[col]?.animal === animal) {
          matches.add(`${row}-${col}`);
          matches.add(`${row + 1}-${col}`);
          matches.add(`${row + 2}-${col}`);
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

  // 初始化网格
  const initializeGrid = useCallback(() => {
    const newGrid: Cell[][] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      const rowCells: Cell[] = [];
      for (let col = 0; col < GRID_COLS; col++) {
        let animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
        if (col >= 2) {
          const left1 = rowCells[col - 1]?.animal;
          const left2 = rowCells[col - 2]?.animal;
          while (animal === left1 && animal === left2) {
            animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
          }
        }
        if (row >= 2) {
          const up1 = newGrid[row - 1]?.[col]?.animal;
          const up2 = newGrid[row - 2]?.[col]?.animal;
          while (animal === up1 && animal === up2) {
            animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
          }
        }
        rowCells.push({id: `${row}-${col}-${Date.now()}-${Math.random()}`, animal});
      }
      newGrid.push(rowCells);
    }
    setGrid(newGrid);
    setScore(0);
    setActiveTool(null);
    setSelectedCell(null);
    setIsProcessing(false);
  }, []);

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  // 系统返回键
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => backHandler.remove();
  }, [onBack]);

  // 下落和填充
  const dropAndFill = useCallback((currentGrid: Cell[][], cellsToRemove: {row: number; col: number}[]) => {
    const newGrid = currentGrid.map(row => row.map(cell => ({...cell})));
    cellsToRemove.forEach(({row, col}) => {
      if (newGrid[row]?.[col]) newGrid[row][col].animal = '';
    });
    
    for (let col = 0; col < GRID_COLS; col++) {
      let writeRow = GRID_ROWS - 1;
      for (let row = GRID_ROWS - 1; row >= 0; row--) {
        if (newGrid[row][col].animal !== '') {
          if (row !== writeRow) {
            newGrid[writeRow][col] = {...newGrid[row][col]};
            newGrid[row][col] = {id: '', animal: ''};
          }
          writeRow--;
        }
      }
      for (let row = writeRow; row >= 0; row--) {
        newGrid[row][col] = {
          id: `new-${row}-${col}-${Date.now()}-${Math.random()}`,
          animal: ANIMALS[Math.floor(Math.random() * ANIMALS.length)],
        };
      }
    }
    return newGrid;
  }, []);

  // 消除并连锁
  const removeAndChain = useCallback((startGrid: Cell[][], firstMatches: {row: number; col: number}[]) => {
    setIsProcessing(true);
    let currentGrid = startGrid;
    let matches = firstMatches;
    
    const doRemove = () => {
      if (matches.length === 0) {
        setIsProcessing(false);
        return;
      }
      
      Vibration.vibrate(30);
      setAnimatingCells(new Set(matches.map(m => `${m.row}-${m.col}`)));
      setScore(prev => prev + matches.length * 10);
      
      setTimeout(() => {
        setAnimatingCells(new Set());
        currentGrid = dropAndFill(currentGrid, matches);
        setGrid(currentGrid);
        
        setTimeout(() => {
          matches = findMatches(currentGrid);
          if (matches.length > 0) {
            doRemove();
          } else {
            setIsProcessing(false);
          }
        }, 100);
      }, 200);
    };
    
    doRemove();
  }, [findMatches, dropAndFill]);

  // 交换格子
  const swapCells = useCallback((row1: number, col1: number, row2: number, col2: number) => {
    if (isProcessing) return;
    
    setSwappingCells(new Set([`${row1}-${col1}`, `${row2}-${col2}`]));
    Vibration.vibrate(15);
    
    setTimeout(() => {
      setSwappingCells(new Set());
      
      setGrid(prevGrid => {
        if (!prevGrid[row1]?.[col1] || !prevGrid[row2]?.[col2]) return prevGrid;
        
        const newGrid = prevGrid.map(r => r.map(c => ({...c})));
        const temp = {...newGrid[row1][col1]};
        newGrid[row1][col1] = {...newGrid[row2][col2]};
        newGrid[row2][col2] = temp;
        
        const matches = findMatches(newGrid);
        if (matches.length > 0) {
          removeAndChain(newGrid, matches);
          return newGrid;
        }
        Vibration.vibrate([0, 20, 50, 20]);
        return prevGrid;
      });
    }, 150);
  }, [findMatches, removeAndChain, isProcessing]);

  // 处理格子点击
  const handleCellPress = useCallback((row: number, col: number) => {
    if (isProcessing) return;
    
    if (activeTool === 'hammer') {
      setAnimatingCells(new Set([`${row}-${col}`]));
      Vibration.vibrate(20);
      setScore(prev => prev + 10);
      setTimeout(() => {
        setAnimatingCells(new Set());
        setGrid(prevGrid => {
          const newGrid = dropAndFill(prevGrid, [{row, col}]);
          const matches = findMatches(newGrid);
          if (matches.length > 0) {
            removeAndChain(newGrid, matches);
          }
          return newGrid;
        });
      }, 250);
      setActiveTool(null);
      return;
    }
    
    if (activeTool === 'bomb') {
      const cellsToRemove: {row: number; col: number}[] = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const r = row + dr, c = col + dc;
          if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
            cellsToRemove.push({row: r, col: c});
          }
        }
      }
      setAnimatingCells(new Set(cellsToRemove.map(m => `${m.row}-${m.col}`)));
      Vibration.vibrate(40);
      setScore(prev => prev + cellsToRemove.length * 10);
      setTimeout(() => {
        setAnimatingCells(new Set());
        setGrid(prevGrid => {
          const newGrid = dropAndFill(prevGrid, cellsToRemove);
          const matches = findMatches(newGrid);
          if (matches.length > 0) {
            removeAndChain(newGrid, matches);
          }
          return newGrid;
        });
      }, 250);
      setActiveTool(null);
      return;
    }
    
    if (selectedCell === null) {
      setSelectedCell({row, col});
    } else if (selectedCell.row === row && selectedCell.col === col) {
      setSelectedCell(null);
    } else {
      const isAdjacent = 
        (Math.abs(selectedCell.row - row) === 1 && selectedCell.col === col) ||
        (Math.abs(selectedCell.col - col) === 1 && selectedCell.row === row);
      
      if (isAdjacent) {
        swapCells(selectedCell.row, selectedCell.col, row, col);
        setSelectedCell(null);
      } else {
        setSelectedCell({row, col});
      }
    }
  }, [activeTool, selectedCell, swapCells, dropAndFill, findMatches, removeAndChain, isProcessing]);

  // 重排道具
  const useShuffle = useCallback(() => {
    if (isProcessing) return;
    
    Vibration.vibrate(30);
    setGrid(prevGrid => {
      const animals: string[] = [];
      prevGrid.forEach(row => row.forEach(cell => animals.push(cell.animal)));
      for (let i = animals.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [animals[i], animals[j]] = [animals[j], animals[i]];
      }
      const newGrid = prevGrid.map((row, rowIdx) =>
        row.map((cell, colIdx) => ({...cell, animal: animals[rowIdx * GRID_COLS + colIdx]}))
      );
      const matches = findMatches(newGrid);
      if (matches.length > 0) {
        removeAndChain(newGrid, matches);
      }
      return newGrid;
    });
    setActiveTool(null);
  }, [findMatches, removeAndChain, isProcessing]);

  // 创建格子手势响应器
  const createPanResponder = useCallback((row: number, col: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !isProcessing,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 10 || Math.abs(gesture.dy) > 10;
      },
      onPanResponderGrant: (evt) => {
        gestureRef.current = {
          startX: evt.nativeEvent.locationX,
          startY: evt.nativeEvent.locationY,
          row,
          col,
          moved: false,
        };
        // 立即选中的逻辑移到 release
      },
      onPanResponderMove: () => {
        if (gestureRef.current) {
          gestureRef.current.moved = true;
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (!gestureRef.current) return;
        
        const {row: startRow, col: startCol, moved} = gestureRef.current;
        const threshold = cellSize * 0.3;
        
        // 如果有滑动且没有激活道具
        if (!activeTool && moved && (Math.abs(gesture.dx) > threshold || Math.abs(gesture.dy) > threshold)) {
          let targetRow = startRow;
          let targetCol = startCol;

          if (Math.abs(gesture.dx) > Math.abs(gesture.dy)) {
            targetCol = gesture.dx > 0 ? startCol + 1 : startCol - 1;
          } else {
            targetRow = gesture.dy > 0 ? startRow + 1 : startRow - 1;
          }

          if (targetRow >= 0 && targetRow < GRID_ROWS && targetCol >= 0 && targetCol < GRID_COLS) {
            swapCells(startRow, startCol, targetRow, targetCol);
            setSelectedCell(null);
          }
        } else {
          // 点击处理 - 这里会处理道具和选中交换
          if (activeTool) {
            // 道具模式直接执行道具效果
            handleCellPress(startRow, startCol);
          } else {
            // 普通模式：如果已有选中且相邻，交换；否则选中当前
            if (selectedCell) {
              const isAdjacent =
                (Math.abs(selectedCell.row - startRow) === 1 && selectedCell.col === startCol) ||
                (Math.abs(selectedCell.col - startCol) === 1 && selectedCell.row === startRow);
              if (isAdjacent) {
                swapCells(selectedCell.row, selectedCell.col, startRow, startCol);
                setSelectedCell(null);
              } else if (selectedCell.row !== startRow || selectedCell.col !== startCol) {
                setSelectedCell({row: startRow, col: startCol});
              }
            } else {
              setSelectedCell({row: startRow, col: startCol});
            }
          }
        }
        
        gestureRef.current = null;
      },
    });
  }, [cellSize, isProcessing, activeTool, swapCells, handleCellPress, selectedCell]);

  // 格子组件
  const CellComponent = ({rowIdx, colIdx}: {rowIdx: number; colIdx: number}) => {
    const cell = grid[rowIdx]?.[colIdx];
    if (!cell) return null;
    
    const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
    const isAnimating = animatingCells.has(`${rowIdx}-${colIdx}`);
    const isSwapping = swappingCells.has(`${rowIdx}-${colIdx}`);
    
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const panResponder = useRef(createPanResponder(rowIdx, colIdx)).current;
    
    useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: isSelected ? 1.1 : 1,
        useNativeDriver: true,
        friction: 5,
      }).start();
    }, [isSelected, scaleAnim]);
    
    useEffect(() => {
      if (isSwapping) {
        Animated.sequence([
          Animated.timing(rotateAnim, {toValue: 1, duration: 50, useNativeDriver: true}),
          Animated.timing(rotateAnim, {toValue: -1, duration: 50, useNativeDriver: true}),
          Animated.timing(rotateAnim, {toValue: 0, duration: 50, useNativeDriver: true}),
        ]).start();
      }
    }, [isSwapping, rotateAnim]);
    
    const rotate = rotateAnim.interpolate({
      inputRange: [-1, 1],
      outputRange: ['-5deg', '5deg'],
    });
    
    return (
      <Animated.View
        style={[
          styles.cell,
          {
            width: cellSize,
            height: cellSize,
            left: GRID_BORDER + colIdx * (cellSize + CELL_GAP),
            top: GRID_BORDER + rowIdx * (cellSize + CELL_GAP),
            transform: [{scale: scaleAnim}, {rotate: rotate}],
          },
          isAnimating && styles.animatingCell,
        ]}
        {...panResponder.panHandlers}>
        <Text style={styles.animalText}>{cell.animal}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <View style={styles.backButton}>
          <Text style={styles.backIcon} onPress={onBack}>←</Text>
        </View>
        <View style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙</Text>
        </View>
      </View>

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

      <View style={styles.gridWrapper}>
        <View style={[styles.grid, {width: gridWidth, height: gridHeight}]}>
          {grid.map((row, rowIdx) =>
            row.map((_, colIdx) => (
              <CellComponent key={`${rowIdx}-${colIdx}`} rowIdx={rowIdx} colIdx={colIdx} />
            )),
          )}
        </View>
      </View>

      <View style={[styles.toolsContainer, {paddingBottom: insets.bottom + 20}]}>
        <View style={[styles.toolButton, activeTool === 'hammer' && styles.activeTool]}>
          <View style={[styles.toolIcon, {backgroundColor: '#ff8fab'}]}>
            <Text style={styles.toolEmoji} onPress={() => setActiveTool(activeTool === 'hammer' ? null : 'hammer')}>🔨</Text>
          </View>
          <Text style={styles.toolLabel}>锤子</Text>
        </View>

        <View style={styles.toolButtonLarge}>
          <View style={[styles.toolIconLarge, {backgroundColor: '#f4d125'}]}>
            <Text style={styles.toolEmojiLarge} onPress={useShuffle}>🔀</Text>
          </View>
          <Text style={styles.toolLabelLarge}>重排</Text>
        </View>

        <View style={[styles.toolButton, activeTool === 'bomb' && styles.activeTool]}>
          <View style={[styles.toolIcon, {backgroundColor: '#8ecae6'}]}>
            <Text style={styles.toolEmoji} onPress={() => setActiveTool(activeTool === 'bomb' ? null : 'bomb')}>💣</Text>
          </View>
          <Text style={styles.toolLabel}>炸弹</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#221f10'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 54,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {fontSize: 24, color: '#fff'},
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {fontSize: 20, color: '#fff'},
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {fontSize: 24, fontWeight: '900'},
  gridWrapper: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  grid: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cell: {
    position: 'absolute',
    backgroundColor: '#322e1b',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0, 0, 0, 0.3)',
  },
  animatingCell: {
    opacity: 0.3,
    transform: [{scale: 0.8}],
  },
  animalText: {fontSize: 24},
  toolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  toolButton: {alignItems: 'center'},
  toolButtonLarge: {alignItems: 'center'},
  activeTool: {opacity: 0.7},
  toolIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  toolIconLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  toolEmoji: {fontSize: 24},
  toolEmojiLarge: {fontSize: 30},
  toolLabel: {fontSize: 11, fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.6)'},
  toolLabelLarge: {fontSize: 12, fontWeight: 'bold', color: '#fff'},
});

export default Match3Game;
