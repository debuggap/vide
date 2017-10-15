<template>
  <li class="npm-package-item" @click="select(item)">
    <div>{{item.name}}</div>
    <p>{{item.desc}}</p>
  </li>
</template>

<script>
export default {
  props: ['item'],
  name: 'npm-package-item',
  methods: {
    select (item) {
      this.$emit('click', item)
    }
  }
}
</script>

<style lang="scss" scoped>
.npm-package-item {
  div {
    font-size:16px;
  }
  p {
    margin:0px;
    color: #838ba5;
  }
}
</style>