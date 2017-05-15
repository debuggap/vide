<template>
  <li :class="[theme, active ? 'active': '']">
    <pre>&lt;<span class="ele">html</span>&gt;
    &lt;<span class="ele">head</span>&gt;
        &lt;<span class="ele">title</span>&gt;Theme:{{theme}}&lt;/<span class="ele">title</span>&gt;
    &lt;/<span class="ele">head</span>&gt;
    &lt;<span class="ele">body</span>&gt;
        &lt;<span class="ele">script</span>&gt;
        <span class="var">document</span>.<span class="func">write</span>(<span class="str">"Hello World!"</span>);
        &lt;/<span class="ele">script</span>&gt;
    &lt;/<span class="ele">body</span>&gt;
    &lt;/<span class="ele">html</span>&gt;</pre>
  </li>
</template>

<script>
// import Vue from 'vue'

export default {
  name: 'item',
  props: ['theme', 'active']
}
</script>

<style lang="scss" scoped>
li.monokai{
  background-color:#272822;
  color: #F8F8F2;
  
  .ele{
    color: #F92672;
  }
  .var{
  	color:#A6E22E;
  }
  .func{
  	color: #66D9EF;
  }
  .str{
  	color: #E6DB74;
  }
}

li.chrome{
  background-color:#FFFFFF;
  color: #000;
  
  .ele{
    color: rgb(147, 15, 128);
  }
  .var{
  	color: rgb(49, 132, 149);
  }
  .func{
  	color: rgb(60, 76, 114);
  }
  .str{
  	color: #1A1AA6;
  }
}
          
.active{
  position:relative;
}
.active:after{
  content: 'Active';
  width: 60px;
  position: absolute;
  left: 50%;
  text-align: center;
  margin-left: -30px;
  top: 50%;
  border: 1px solid #cc6600;
  border-radius: 10px;
}
</style>