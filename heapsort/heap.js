 
        // Global state
        let numbers = [];
        let steps = [];
        let currentStep = 0;
        let animationInterval = null;

        // Initialize
        document.getElementById('count').addEventListener('input', function(e) {
            const count = parseInt(e.target.value);
            const numbersContainer = document.getElementById('numbersContainer');
            const animateButtonContainer = document.getElementById('animateButtonContainer');
            const numbersGrid = document.getElementById('numbersGrid');

            if (isNaN(count) || count <= 0 || count > 20) {
                numbersContainer.classList.add('hidden');
                animateButtonContainer.classList.add('hidden');
                return;
            }

            // Create input fields
            numbersGrid.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const wrapper = document.createElement('div');
                wrapper.className = 'number-input-wrapper';
                
                const label = document.createElement('span');
                label.className = 'number-label';
                label.textContent = `Number ${i + 1}`;
                
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = '0';
                input.dataset.index = i;
                
                wrapper.appendChild(label);
                wrapper.appendChild(input);
                numbersGrid.appendChild(wrapper);
            }

            numbersContainer.classList.remove('hidden');
            animateButtonContainer.classList.remove('hidden');
        });

        function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        function validateAndAnimate() {
            const count = parseInt(document.getElementById('count').value);
            
            if (isNaN(count) || count <= 0) {
                showToast('Please enter a valid count of numbers (greater than 0)');
                return;
            }

            if (count > 20) {
                showToast('Please enter a count of 20 or less for better visualization');
                return;
            }

            const inputs = document.querySelectorAll('#numbersGrid input');
            const values = [];

            for (let input of inputs) {
                const value = input.value.trim();
                if (value === '') {
                    showToast('Please fill in all number fields');
                    return;
                }

                const num = parseFloat(value);
                if (isNaN(num)) {
                    showToast('Please enter valid numbers in all fields');
                    return;
                }

                values.push(num);
            }

            numbers = values;
            startVisualization();
        }

        function startVisualization() {
            document.getElementById('inputSection').classList.add('hidden');
            document.getElementById('visualizationSection').classList.remove('hidden');

            steps = generateHeapSortSteps([...numbers]);
            currentStep = 0;
            renderStep();

            animationInterval = setInterval(() => {
                if (currentStep < steps.length - 1) {
                    currentStep++;
                    renderStep();
                } else {
                    clearInterval(animationInterval);
                    showHeapTree();
                }
            }, 1000);
        }

        function renderStep() {
            const step = steps[currentStep];
            
            // Update step info
            document.getElementById('stepBadge').textContent = `Step ${currentStep + 1} of ${steps.length}`;
            document.getElementById('stepDescription').textContent = step.description;

            // Render bar chart
            const barChart = document.getElementById('barChart');
            barChart.innerHTML = '';

            const maxValue = Math.max(...numbers);

            step.array.forEach((value, index) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'bar-wrapper';

                const bar = document.createElement('div');
                bar.className = 'bar';
                
                if (step.sorted.includes(index)) {
                    bar.classList.add('sorted');
                } else if (step.swapping.includes(index)) {
                    bar.classList.add('swapping');
                } else if (step.comparing.includes(index)) {
                    bar.classList.add('comparing');
                }

                const height = (value / maxValue) * 100;
                bar.style.height = `${height}%`;
                bar.textContent = value;

                const indexLabel = document.createElement('div');
                indexLabel.className = 'bar-index';
                indexLabel.textContent = index;

                wrapper.appendChild(bar);
                wrapper.appendChild(indexLabel);
                barChart.appendChild(wrapper);
            });
        }

        function generateHeapSortSteps(arr) {
            const steps = [];
            const n = arr.length;

            steps.push({
                array: [...arr],
                heapSize: n,
                comparing: [],
                swapping: [],
                sorted: [],
                description: 'Initial array'
            });

            // Build max heap
            for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
                heapify(arr, n, i, steps, []);
            }

            steps.push({
                array: [...arr],
                heapSize: n,
                comparing: [],
                swapping: [],
                sorted: [],
                description: 'Max heap built'
            });

            // Extract elements from heap
            for (let i = n - 1; i > 0; i--) {
                const sorted = Array.from({ length: n - i - 1 }, (_, idx) => n - 1 - idx);
                
                steps.push({
                    array: [...arr],
                    heapSize: i + 1,
                    comparing: [],
                    swapping: [0, i],
                    sorted: sorted,
                    description: `Swapping root (${arr[0]}) with last element (${arr[i]})`
                });

                [arr[0], arr[i]] = [arr[i], arr[0]];

                const sortedAfter = Array.from({ length: n - i }, (_, idx) => n - 1 - idx);
                steps.push({
                    array: [...arr],
                    heapSize: i,
                    comparing: [],
                    swapping: [],
                    sorted: sortedAfter,
                    description: `Element ${arr[i]} is now in sorted position`
                });

                heapify(arr, i, 0, steps, sortedAfter);
            }

            steps.push({
                array: [...arr],
                heapSize: 0,
                comparing: [],
                swapping: [],
                sorted: Array.from({ length: n }, (_, idx) => idx),
                description: 'Sorting complete!'
            });

            return steps;
        }

        function heapify(arr, heapSize, i, steps, sorted) {
            let largest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;

            if (left < heapSize) {
                steps.push({
                    array: [...arr],
                    heapSize,
                    comparing: [largest, left],
                    swapping: [],
                    sorted,
                    description: `Comparing ${arr[largest]} with left child ${arr[left]}`
                });

                if (arr[left] > arr[largest]) {
                    largest = left;
                }
            }

            if (right < heapSize) {
                steps.push({
                    array: [...arr],
                    heapSize,
                    comparing: [largest, right],
                    swapping: [],
                    sorted,
                    description: `Comparing ${arr[largest]} with right child ${arr[right]}`
                });

                if (arr[right] > arr[largest]) {
                    largest = right;
                }
            }

            if (largest !== i) {
                steps.push({
                    array: [...arr],
                    heapSize,
                    comparing: [],
                    swapping: [i, largest],
                    sorted,
                    description: `Swapping ${arr[i]} with ${arr[largest]} to maintain heap property`
                });

                [arr[i], arr[largest]] = [arr[largest], arr[i]];

                steps.push({
                    array: [...arr],
                    heapSize,
                    comparing: [],
                    swapping: [],
                    sorted,
                    description: `Swapped. Now heapifying subtree at index ${largest}`
                });

                heapify(arr, heapSize, largest, steps, sorted);
            }
        }

        function showHeapTree() {
            const treeSection = document.getElementById('treeSection');
            treeSection.classList.remove('hidden');

            const finalArray = steps[steps.length - 1].array;
            renderHeapTree(finalArray);
        }

        function renderHeapTree(array) {
            const svg = document.getElementById('treeSvg');
            const nodes = calculateTreeLayout(array);

            if (nodes.length === 0) return;

            const minX = Math.min(...nodes.map(n => n.x)) - 50;
            const maxX = Math.max(...nodes.map(n => n.x)) + 50;
            const minY = 0;
            const maxY = Math.max(...nodes.map(n => n.y)) + 50;

            const width = maxX - minX;
            const height = maxY - minY;

            svg.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`);

            // Clear existing content
            svg.innerHTML = '';

            // Draw edges
            nodes.forEach((node, idx) => {
                const leftChildIndex = 2 * node.index + 1;
                const rightChildIndex = 2 * node.index + 2;

                if (leftChildIndex < array.length) {
                    const leftChild = nodes[leftChildIndex];
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', node.x);
                    line.setAttribute('y1', node.y + 20);
                    line.setAttribute('x2', leftChild.x);
                    line.setAttribute('y2', leftChild.y + 20);
                    line.setAttribute('stroke', '#cbd5e1');
                    line.setAttribute('stroke-width', '2');
                    line.classList.add('tree-edge');
                    line.style.animationDelay = `${idx * 0.05}s`;
                    svg.appendChild(line);
                }

                if (rightChildIndex < array.length) {
                    const rightChild = nodes[rightChildIndex];
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', node.x);
                    line.setAttribute('y1', node.y + 20);
                    line.setAttribute('x2', rightChild.x);
                    line.setAttribute('y2', rightChild.y + 20);
                    line.setAttribute('stroke', '#cbd5e1');
                    line.setAttribute('stroke-width', '2');
                    line.classList.add('tree-edge');
                    line.style.animationDelay = `${idx * 0.05}s`;
                    svg.appendChild(line);
                }
            });

            // Draw nodes
            nodes.forEach((node, idx) => {
                const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                g.classList.add('tree-node');
                g.style.animationDelay = `${idx * 0.1}s`;

                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', node.x);
                circle.setAttribute('cy', node.y + 20);
                circle.setAttribute('r', '20');
                circle.setAttribute('fill', '#10b981');
                circle.setAttribute('stroke', '#059669');
                circle.setAttribute('stroke-width', '2');

                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', node.x);
                text.setAttribute('y', node.y + 20);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('dominant-baseline', 'middle');
                text.setAttribute('fill', 'white');
                text.setAttribute('font-size', '14');
                text.setAttribute('font-weight', '600');
                text.textContent = node.value;

                const indexText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                indexText.setAttribute('x', node.x);
                indexText.setAttribute('y', node.y + 45);
                indexText.setAttribute('text-anchor', 'middle');
                indexText.setAttribute('fill', '#64748b');
                indexText.setAttribute('font-size', '10');
                indexText.textContent = `[${node.index}]`;

                g.appendChild(circle);
                g.appendChild(text);
                g.appendChild(indexText);
                svg.appendChild(g);
            });
        }

        function calculateTreeLayout(array) {
            const nodes = [];
            const totalLevels = Math.ceil(Math.log2(array.length + 1));
            const nodeSpacing = 80;
            const levelHeight = 100;

            let currentIndex = 0;

            for (let level = 0; level < totalLevels; level++) {
                const nodesInLevel = Math.pow(2, level);
                const levelWidth = nodeSpacing * Math.pow(2, totalLevels - level - 1);

                for (let i = 0; i < nodesInLevel && currentIndex < array.length; i++) {
                    const x = (i + 0.5) * levelWidth - (nodesInLevel * levelWidth) / 2;
                    const y = level * levelHeight;

                    nodes.push({
                        value: array[currentIndex],
                        index: currentIndex,
                        x: x,
                        y: y,
                        level: level
                    });

                    currentIndex++;
                }
            }

            return nodes;
        }

        function resetApp() {
            clearInterval(animationInterval);
            
            document.getElementById('inputSection').classList.remove('hidden');
            document.getElementById('visualizationSection').classList.add('hidden');
            document.getElementById('treeSection').classList.add('hidden');
            
            document.getElementById('count').value = '';
            document.getElementById('numbersContainer').classList.add('hidden');
            document.getElementById('animateButtonContainer').classList.add('hidden');
            
            numbers = [];
            steps = [];
            currentStep = 0;
        }
    