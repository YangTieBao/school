<template>
  <Table :index="$route.query.index"></Table>
</template>
<script>
import Table from "../components/Table/Table.vue";
export default {
  components: {
    Table,
  },
};
</script>