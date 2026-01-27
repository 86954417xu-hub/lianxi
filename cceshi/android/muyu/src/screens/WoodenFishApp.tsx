import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  BackHandler,
  Vibration,
  TextInput,
  Alert,
  PanResponder,
  Image,
  Dimensions,
} from 'react-native';
import DocumentPicker, {types} from 'react-native-document-picker';
import WoodFish from '../components/WoodFish';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {saveImage, getSavedImagePath, clearImageCache, saveWoodFishType, getWoodFishType} from '../utils/ImageStorage';
import {saveAudio, getSavedAudioPath, clearAudioCache} from '../utils/AudioStorage';
import {soundManager} from '../utils/SoundManager';

interface FloatingText {
  id: number;
  text: string;
  left: string;
  top: string;
  opacity: Animated.Value;
  translateY: Animated.Value;
}

const WoodenFishApp: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [woodFishImage, setWoodFishImage] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [floatingText, setFloatingText] = useState<string>('功德+1');
  const [customText, setCustomText] = useState<string>('');
  const [showTextEdit, setShowTextEdit] = useState<boolean>(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [textColor, setTextColor] = useState<string>('#000000');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showCountPrefixEdit, setShowCountPrefixEdit] = useState<boolean>(false);
  const [countPrefix, setCountPrefix] = useState<string>('已敲');
  const [tempCountPrefix, setTempCountPrefix] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [customSoundPath, setCustomSoundPath] = useState<string | null>(null);
  const [selectedWoodFishType, setSelectedWoodFishType] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'home' | 'rosary' | 'profile'>('home');
  const [rosaryCount, setRosaryCount] = useState<number>(0);
  const [currentBead, setCurrentBead] = useState<number>(0);
  const lastScrollY = useRef<number>(0);
  const hasScrolled = useRef<boolean>(false);

  const rotationAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const textIdCounter = useRef<number>(0);

  useEffect(() => {
    loadCount();
    loadCustomImages();
    loadFloatingText();
    loadTextColor();
    loadCountPrefix();
    loadSoundEnabled();
    loadCustomSound();
    loadWoodFishType();
    loadRosaryCount();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // 如果在弹窗中，关闭弹窗
      if (showTextEdit) {
        setShowTextEdit(false);
        return true;
      }
      if (showColorPicker) {
        setShowColorPicker(false);
        return true;
      }
      // 如果在设置标签页，返回首页
      if (activeTab === 'profile' || activeTab === 'rosary') {
        setActiveTab('home');
        return true;
      }
      // 在其他页面弹出退出确认
      setShowExitModal(true);
      return true;
    });

    return () => {
      if (backHandler && backHandler.remove) {
        backHandler.remove();
      }
    };
  }, [showTextEdit, showColorPicker, activeTab]);

  const loadCount = async () => {
    try {
      const savedCount = await AsyncStorage.getItem('woodenFishCount');
      if (savedCount) {
        setCount(parseInt(savedCount, 10));
      }
    } catch (error) {
      console.error('Failed to load count:', error);
    }
  };

  const saveCount = async (newCount: number) => {
    try {
      await AsyncStorage.setItem('woodenFishCount', newCount.toString());
    } catch (error) {
      console.error('Failed to save count:', error);
    }
  };

  const loadCustomImages = async () => {
    try {
      const woodFishPath = await getSavedImagePath('woodFish');
      if (woodFishPath) setWoodFishImage(woodFishPath);
    } catch (error) {
      console.error('Failed to load images:', error);
    }
  };

  const loadFloatingText = async () => {
    try {
      const savedText = await AsyncStorage.getItem('floatingText');
      if (savedText) setFloatingText(savedText);
    } catch (error) {
      console.error('Failed to load floating text:', error);
    }
  };

  const loadTextColor = async () => {
    try {
      const savedColor = await AsyncStorage.getItem('textColor');
      if (savedColor) setTextColor(savedColor);
    } catch (error) {
      console.error('Failed to load text color:', error);
    }
  };

  const loadCountPrefix = async () => {
    try {
      const savedPrefix = await AsyncStorage.getItem('countPrefix');
      if (savedPrefix) setCountPrefix(savedPrefix);
    } catch (error) {
      console.error('Failed to load count prefix:', error);
    }
  };

  const loadSoundEnabled = async () => {
    try {
      const savedSoundEnabled = await AsyncStorage.getItem('soundEnabled');
      if (savedSoundEnabled !== null) {
        setSoundEnabled(savedSoundEnabled === 'true');
      }
    } catch (error) {
      console.error('Failed to load sound enabled:', error);
    }
  };

  const loadCustomSound = async () => {
    try {
      const path = await getSavedAudioPath();
      if (path) {
        setCustomSoundPath(path);
      }
    } catch (error) {
      console.error('Failed to load custom sound:', error);
    }
  };

  const loadWoodFishType = async () => {
    try {
      const type = await getWoodFishType();
      setSelectedWoodFishType(type);
    } catch (error) {
      console.error('Failed to load wood fish type:', error);
    }
  };

  const loadRosaryCount = async () => {
    try {
      const savedRosaryCount = await AsyncStorage.getItem('rosaryCount');
      const savedCurrentBead = await AsyncStorage.getItem('currentBead');
      if (savedRosaryCount) {
        setRosaryCount(parseInt(savedRosaryCount, 10));
      }
      if (savedCurrentBead) {
        setCurrentBead(parseInt(savedCurrentBead, 10));
      }
    } catch (error) {
      console.error('Failed to load rosary count:', error);
    }
  };

  const saveRosaryCount = async (newCount: number, newBead: number) => {
    try {
      await AsyncStorage.setItem('rosaryCount', newCount.toString());
      await AsyncStorage.setItem('currentBead', newBead.toString());
    } catch (error) {
      console.error('Failed to save rosary count:', error);
    }
  };

  const rosaryPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 只有垂直滑动超过阈值才捕获手势
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        // 手势开始，记录起始位置和是否滚动过
        lastScrollY.current = 0;
        hasScrolled.current = false;
      },
      onPanResponderMove: (_, gestureState) => {
        // 处理滑动手势
        const threshold = 100; // 滑动阈值，超过这个距离就滚动一颗珠子
        const scrollDirection = gestureState.dy < 0 ? 1 : -1; // 向上滑动为1，向下滑动为-1
        const currentDistance = Math.abs(gestureState.dy);

        // 计算从上次滚动后的相对距离
        const relativeDistance = currentDistance - lastScrollY.current;

        if (relativeDistance >= threshold) {
          const nextBead = (currentBead + scrollDirection + 108) % 108;
          setCurrentBead(nextBead);

          // 仅震动反馈，无位移动画
          if (soundEnabled) {
            Vibration.vibrate(50);
          }

          // 更新上次滚动位置
          lastScrollY.current = currentDistance;
          // 标记已滚动
          hasScrolled.current = true;
        }
      },
      onPanResponderRelease: () => {
        // 只有滚动过才增加计数
        if (hasScrolled.current) {
          const newCount = rosaryCount + 1;
          setRosaryCount(newCount);
          saveRosaryCount(newCount, currentBead);

          // 松手时的确认震动反馈
          if (soundEnabled) {
            Vibration.vibrate(100);
          }
        }

        // 重置记录
        lastScrollY.current = 0;
        hasScrolled.current = false;
      },
    })
  ).current;

  const resetRosaryCount = () => {
    Alert.alert(
      '重置念珠',
      '确定要重置念珠计数吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: () => {
            setRosaryCount(0);
            setCurrentBead(0);
            saveRosaryCount(0, 0);
          },
          style: 'destructive',
        },
      ]
    );
  };



  const handleAudioUpload = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [types.audio],
        allowMultiSelection: false,
      });

      if (result && result.length > 0) {
        const file = result[0];
        if (file.uri) {
          const savedPath = await saveAudio(file.uri);
          if (savedPath) {
            setCustomSoundPath(savedPath);
            Alert.alert('成功', '音频上传成功');
          } else {
            Alert.alert('失败', '音频上传失败');
          }
        }
      }
    } catch (error: any) {
      if (DocumentPicker.isCancel(error)) {
        console.log('User cancelled the picker');
      } else {
        console.error('Error picking document:', error);
        Alert.alert('错误', '选择音频失败');
      }
    }
  };

  const toggleSound = async () => {
    const newEnabled = !soundEnabled;
    setSoundEnabled(newEnabled);
    try {
      await AsyncStorage.setItem('soundEnabled', String(newEnabled));
    } catch (error) {
      console.error('Failed to save sound enabled:', error);
    }
  };

  const saveFloatingText = async (text: string) => {
    try {
      await AsyncStorage.setItem('floatingText', text);
      setFloatingText(text);
    } catch (error) {
      console.error('Failed to save floating text:', error);
    }
  };

  const saveTextColor = async (color: string) => {
    try {
      await AsyncStorage.setItem('textColor', color);
      setTextColor(color);
    } catch (error) {
      console.error('Failed to save text color:', error);
    }
  };

  const handleTap = (event?: any) => {
    const newCount = count + 1;
    setCount(newCount);
    saveCount(newCount);

    // 播放木鱼声音和震动
    if (soundEnabled) {
      try {
        // 直接调用震动,确保荣耀手机震动生效
        Vibration.vibrate(50);
        soundManager.playWoodFishSound();
      } catch (error) {
        console.log('Sound error:', error);
      }
    }

    // 木鱼摆动动画
    Animated.sequence([
      Animated.timing(rotationAnim, {
        toValue: -0.2,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(rotationAnim, {
        toValue: 0.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(rotationAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // 木鱼缩放动画
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // 如果有位置信息，添加漂浮文字
    if (event?.nativeEvent?.locationX !== undefined && event?.nativeEvent?.locationY !== undefined) {
      addFloatingTextAtPosition(event.nativeEvent.locationX, event.nativeEvent.locationY);
    }
  };



  const addFloatingTextAtPosition = (clickX: number, clickY: number) => {
    const id = textIdCounter.current++;

    // 创建动画值（不使用 hook）
    const opacity = new Animated.Value(1);
    const translateY = new Animated.Value(0);

    const newText: FloatingText = {
      id,
      text: floatingText,
      left: '50%', // 固定水平居中
      top: '35%', // 固定垂直位置
      opacity,
      translateY,
    };

    setFloatingTexts(prev => [...prev, newText]);

    // 向上漂浮并逐渐变淡
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setFloatingTexts(prev => prev.filter(item => item.id !== id));
    });
  };

  const handleWoodFishUpload = async () => {
    const path = await saveImage('woodFish');
    if (path) setWoodFishImage(path);
  };

  const resetAllSettings = () => {
    setWoodFishImage(null);
    clearImageCache();
    setFloatingText('功德+1');
    setTextColor('#000000');
    setCountPrefix('已敲');
    setSoundEnabled(true);
    setCustomSoundPath(null);
    setSelectedWoodFishType(1);
    clearAudioCache();
    AsyncStorage.setItem('floatingText', '功德+1');
    AsyncStorage.setItem('textColor', '#000000');
    AsyncStorage.setItem('countPrefix', '已敲');
    AsyncStorage.setItem('soundEnabled', 'true');
    AsyncStorage.setItem('woodFishType', '1');
  };

  const handleExitConfirm = () => {
    setShowExitModal(false);
    // 退出应用
    BackHandler.exitApp();
  };

  const handleExitCancel = () => {
    setShowExitModal(false);
  };

  const handleWoodFishTypeChange = async (type: number) => {
    setSelectedWoodFishType(type);
    await saveWoodFishType(type);
    setWoodFishImage(null);
  };

  const handleResetCount = () => {
    Alert.alert(
      '重置计数',
      '确定要重置已敲次数吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: () => {
            setCount(0);
            saveCount(0);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleSaveCustomText = () => {
    try {
      const textToSave = customText.trim();
      if (textToSave) {
        saveFloatingText(textToSave);
        setFloatingText(textToSave);
        setShowTextEdit(false);
      }
    } catch (error) {
      console.error('Error saving custom text:', error);
    }
  };

  const openTextEdit = () => {
    try {
      setCustomText(floatingText);
      setShowTextEdit(true);
    } catch (error) {
      console.error('Error opening text edit:', error);
    }
  };

  const handleSaveCountPrefix = () => {
    try {
      const prefixToSave = tempCountPrefix.trim();
      if (prefixToSave) {
        AsyncStorage.setItem('countPrefix', prefixToSave);
        setCountPrefix(prefixToSave);
        setShowCountPrefixEdit(false);
      }
    } catch (error) {
      console.error('Error saving count prefix:', error);
    }
  };

  const openCountPrefixEdit = () => {
    try {
      setTempCountPrefix(countPrefix);
      setShowCountPrefixEdit(true);
    } catch (error) {
      console.error('Error opening count prefix edit:', error);
    }
  };

  const renderHomeScreen = () => (
    <View style={styles.homeContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={openCountPrefixEdit} activeOpacity={0.7} style={styles.countContainer}>
          <Text style={styles.countText}>{countPrefix} {count} 下</Text>
          <TouchableOpacity onPress={handleResetCount} activeOpacity={0.7} style={styles.resetCountButton}>
            <Text style={styles.resetCountIcon}>↻</Text>
          </TouchableOpacity>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowSettingsModal(true)} activeOpacity={0.7} style={styles.settingsButtonSmall}>
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.fishContainer}>
        <Animated.View
          style={[
            styles.animatedFish,
            {
              transform: [
                {
                  rotate: rotationAnim.interpolate({
                    inputRange: [-1, 1],
                    outputRange: ['-10deg', '10deg'],
                  }),
                },
                {scale: scaleAnim},
              ],
            },
          ]}>
          <WoodFish customImage={woodFishImage} woodFishType={selectedWoodFishType} />
        </Animated.View>
      </View>

      {floatingTexts.map(item => (
        <Animated.View
          key={item.id}
          style={[
            styles.floatingText,
            {
              left: item.left,
              top: item.top,
              opacity: item.opacity,
              transform: [{translateY: item.translateY}],
            },
          ] as any}>
          <Text style={[styles.floatingTextContent, {color: textColor}]}>{item.text}</Text>
        </Animated.View>
      ))}

      <TouchableOpacity
        style={styles.tapArea}
        activeOpacity={1}
        onPress={handleTap}
      />
    </View>
  );

  const renderRosaryScreen = () => {
    // 始终显示固定的5颗珠子（位置固定，只改变显示内容）
    const visibleBeads = [
      { index: (currentBead - 2 + 108) % 108, distance: -2 },
      { index: (currentBead - 1 + 108) % 108, distance: -1 },
      { index: currentBead, distance: 0 },
      { index: (currentBead + 1) % 108, distance: 1 },
      { index: (currentBead + 2) % 108, distance: 2 },
    ];

      return (
        <View style={styles.rosaryContainer}>
          <View style={styles.rosaryHeader}>
            <Text style={styles.rosaryCountText}>已祈福 {rosaryCount} 次</Text>
            <TouchableOpacity onPress={resetRosaryCount} activeOpacity={0.7} style={styles.resetRosaryButton}>
              <Text style={styles.resetRosaryIcon}>↻</Text>
            </TouchableOpacity>
          </View>

        <View style={styles.rosaryBeadsContainer}>
            {visibleBeads.map((bead, index) => {
              const isCurrentBead = bead.distance === 0;
              const distance = Math.abs(bead.distance);

              // 根据距离设置珠子样式和缩放
              const baseSize = 70; // 基础大小70px
              const scaleFactor = isCurrentBead ? 1.4 : 1.0 - distance * 0.2;
              const beadSize = baseSize * scaleFactor;
              const beadOpacity = isCurrentBead ? 1.0 : 1.0 - distance * 0.2;
              const borderWidth = isCurrentBead ? 3 : 1;

              return (
                <View
                  key={`${bead.index}-${index}`}
                  style={[
                    styles.rosaryBeadWrapper,
                    { height: 112 },
                  ]}>
                  <Image
                    source={require('../../assets/rosary_bead.png')}
                    style={[
                      styles.rosaryBeadImage,
                      {
                        width: beadSize,
                        height: beadSize,
                        opacity: beadOpacity,
                        borderWidth: borderWidth,
                        borderColor: isCurrentBead ? '#FFD700' : '#888',
                      },
                    ]}
                    resizeMode="contain"
                  />
                </View>
              );
            })}
        </View>







        <View
          style={styles.rosaryTapArea}
          {...rosaryPanResponder.panHandlers}
        />
      </View>
    );
  };

  const renderProfileScreen = () => (
    <View style={styles.settingsContainer}>
      <Text style={styles.profileTitle}>个人中心</Text>
      <TouchableOpacity style={styles.suggestionButton}>
        <Text style={styles.suggestionButtonText}>该做什么功能呢</Text>
        <Text style={styles.suggestionArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.suggestionButton}>
        <Text style={styles.suggestionButtonText}>隐私政策</Text>
        <Text style={styles.suggestionArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.suggestionButton}>
        <Text style={styles.suggestionButtonText}>用户协议</Text>
        <Text style={styles.suggestionArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.suggestionButton}>
        <Text style={styles.suggestionButtonText}>意见反馈</Text>
        <Text style={styles.suggestionArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );



  return (
    <SafeAreaView style={styles.container}>
      {activeTab === 'home' ? renderHomeScreen() : 
       activeTab === 'rosary' ? renderRosaryScreen() : renderProfileScreen()}

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'home' && styles.navButtonActive]}
          activeOpacity={0.7}
          onPress={() => setActiveTab('home')}>
          <Text style={[styles.navButtonText, activeTab === 'home' && styles.navButtonTextActive]}>木鱼</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'rosary' && styles.navButtonActive]}
          activeOpacity={0.7}
          onPress={() => setActiveTab('rosary')}>
          <Text style={[styles.navButtonText, activeTab === 'rosary' && styles.navButtonTextActive]}>念珠</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'profile' && styles.navButtonActive]}
          activeOpacity={0.7}
          onPress={() => setActiveTab('profile')}>
          <Text style={[styles.navButtonText, activeTab === 'profile' && styles.navButtonTextActive]}>我的</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={handleExitCancel}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>是否退出？</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleExitCancel}>
                <Text style={styles.modalButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleExitConfirm}>
                <Text style={styles.modalButtonText}>退出</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTextEdit}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTextEdit(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>修改文案</Text>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={customText || ''}
                onChangeText={setCustomText}
                placeholder={floatingText}
                placeholderTextColor="#999"
                autoFocus={true}
                multiline={false}
                textAlignVertical="top"
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTextEdit(false)}>
                <Text style={styles.modalButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSaveCustomText}>
                <Text style={styles.modalButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showColorPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowColorPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>修改文字颜色</Text>
            <View style={styles.colorPickerContainer}>
              {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF', '#FFD700', '#FF6B6B', '#4ECDC4'].map(color => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, {backgroundColor: color}, textColor === color && styles.colorOptionSelected]}
                  onPress={() => {
                    saveTextColor(color);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowColorPicker(false)}>
                <Text style={styles.modalButtonText}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCountPrefixEdit}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCountPrefixEdit(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>修改前缀文案</Text>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={tempCountPrefix || ''}
                onChangeText={(text) => {
                  const trimmed = text.trim();
                  if (trimmed.length <= 6) {
                    setTempCountPrefix(trimmed);
                  }
                }}
                placeholder="最多6个字"
                placeholderTextColor="#999"
                autoFocus={true}
                multiline={false}
                maxLength={6}
              />
            </View>
            <Text style={styles.hintText}>当前: {tempCountPrefix} ({tempCountPrefix.length}/6)</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCountPrefixEdit(false)}>
                <Text style={styles.modalButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSaveCountPrefix}>
                <Text style={styles.modalButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSettingsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettingsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.settingsModalContent]}>
            <Text style={styles.modalTitle}>设置</Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleWoodFishUpload}>
              <Text style={styles.settingsButtonText}>上传自定义图片</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={openTextEdit}
              activeOpacity={0.7}>
              <Text style={styles.settingsButtonText}>修改漂浮文案 ({floatingText})</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setShowColorPicker(true)}
              activeOpacity={0.7}>
              <Text style={styles.settingsButtonText}>修改漂浮文字颜色</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={toggleSound}
              activeOpacity={0.7}>
              <Text style={styles.settingsButtonText}>音效: {soundEnabled ? '开启' : '关闭'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleAudioUpload}
              activeOpacity={0.7}>
              <Text style={styles.settingsButtonText}>上传自定义音效</Text>
            </TouchableOpacity>
            <View style={styles.woodFishSelector}>
              <Text style={styles.woodFishSelectorTitle}>选择木鱼样式</Text>
              <View style={styles.woodFishButtons}>
                <TouchableOpacity
                  style={[styles.woodFishButton, selectedWoodFishType === 1 && styles.woodFishButtonActive]}
                  onPress={() => handleWoodFishTypeChange(1)}>
                  <Text style={[styles.woodFishButtonText, selectedWoodFishType === 1 && styles.woodFishButtonTextActive]}>木鱼 1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.woodFishButton, selectedWoodFishType === 2 && styles.woodFishButtonActive]}
                  onPress={() => handleWoodFishTypeChange(2)}>
                  <Text style={[styles.woodFishButtonText, selectedWoodFishType === 2 && styles.woodFishButtonTextActive]}>木鱼 2</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.resetButton} onPress={resetAllSettings}>
              <Text style={styles.resetButtonText}>恢复默认</Text>
            </TouchableOpacity>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowSettingsModal(false)}>
                <Text style={styles.modalButtonText}>关闭</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  homeContent: {
    flex: 1,
  },
  profileContent: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 45,
    paddingBottom: 20,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  resetCountButton: {
    marginLeft: 8,
    padding: 0,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  resetCountIcon: {
    fontSize: 22,
    color: '#666',
    lineHeight: 32,
    textAlign: 'center',
    marginTop: -3,
  },
  settingsIcon: {
    fontSize: 24,
    color: '#666',
    lineHeight: 32,
  },
  settingsButtonSmall: {
    padding: 0,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fishContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  animatedFish: {
    alignItems: 'center',
  },
  tapArea: {
    position: 'absolute',
    width: '70%',
    height: '40%',
    top: '35%',
    left: '15%',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
    paddingBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navButtonActive: {
    opacity: 1,
  },
  navButtonText: {
    fontSize: 16,
    color: '#999',
  },
  navButtonTextActive: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  menuContainer: {
    marginTop: 20,
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  settingsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  profileTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  suggestionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: '100%',
  },
  suggestionButtonText: {
    color: '#333',
    fontSize: 18,
    textAlign: 'left',
  },
  suggestionArrow: {
    color: '#999',
    fontSize: 24,
    fontWeight: '300',
  },
  settingsModalContent: {
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  settingsButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    width: '100%',
    marginBottom: 10,
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#666',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    width: '80%',
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#FF5252',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  floatingText: {
    position: 'absolute',
    zIndex: 10,
    pointerEvents: 'none',
  },
  floatingTextContent: {
    fontSize: 24,
    fontWeight: 'normal',
    color: '#000000',
    textShadowColor: '#fff',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  textInputContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  textInput: {
    width: '100%',
    padding: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
    color: '#333',
  },
  colorPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 5,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  colorOptionSelected: {
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  woodFishSelector: {
    width: '100%',
    marginBottom: 10,
  },
  woodFishSelectorTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  woodFishButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  woodFishButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  woodFishButtonActive: {
    backgroundColor: '#4CAF50',
  },
  woodFishButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  woodFishButtonTextActive: {
    color: '#fff',
  },
  rosaryContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  rosaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 20,
    backgroundColor: '#f5f5f5',
  },
  rosaryCountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  resetRosaryButton: {
    padding: 0,
    backgroundColor: '#e0d5c1',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetRosaryIcon: {
    fontSize: 22,
    color: '#8B4513',
    lineHeight: 32,
    textAlign: 'center',
    marginTop: -3,
  },
  rosaryBeadsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  rosaryBeadWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rosaryBead: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rosaryBeadImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rosaryTapArea: {
    position: 'absolute',
    width: '100%',
    height: '70%',
    top: '15%',
    left: 0,
  },
});

export default WoodenFishApp;
